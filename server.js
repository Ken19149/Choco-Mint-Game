const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Jimp } = require('jimp'); // The image reader

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// --- SERVER STATE ---
const players = {}; 
const masterPixelMap = new Set();
let unassignedSectors = []; // Queue of work
let completedSectors = [];  // Finished work
let allPaintedPixels = [];  // Pixel memory log
let gameState = 'lobby'; // Can be 'lobby' or 'playing'

// Grid math: 25x24 image divided into 20 players = 5 cols x 4 rows
const SECTOR_COLS = 5;
const SECTOR_ROWS = 4;

// --- 1. THE IMAGE PIPELINE ---
async function initCanvasData(imagePath) {
    console.log("Booting Art Pipeline...");
    try {
        const image = await Jimp.read(imagePath);
        const imgW = image.bitmap.width;
        const imgH = image.bitmap.height;

        const sectorW = Math.floor(imgW / SECTOR_COLS); // e.g., 5 pixels wide
        const sectorH = Math.floor(imgH / SECTOR_ROWS); // e.g., 6 pixels tall

        let sectorId = 1;

        // Loop through the grid and slice the image into sectors
        for (let r = 0; r < SECTOR_ROWS; r++) {
            for (let c = 0; c < SECTOR_COLS; c++) {
                const minX = c * sectorW;
                const minY = r * sectorH;

                // Extract the colors for THIS specific chunk
                let pixelData = [];
                for (let y = 0; y < sectorH; y++) {
                    let row = [];
                    for (let x = 0; x < sectorW; x++) {
                        // Get Jimp hex (RGBA) and convert to standard CSS Hex (#RRGGBB)
                        const hexColor = image.getPixelColor(minX + x, minY + y);
                        const cssColor = '#' + hexColor.toString(16).slice(0, 6).padStart(6, '0');
                        row.push(cssColor);
                    }
                    pixelData.push(row);
                }

                // Push this chunk into the work queue
                unassignedSectors.push({
                    id: sectorId++,
                    bounds: { minX, minY, width: sectorW, height: sectorH },
                    pixels: pixelData // The 2D array of colors they need to match
                });
            }
        }
        console.log(`✅ Successfully generated ${unassignedSectors.length} sectors!`);
    } catch (err) {
        console.error("❌ Error loading image. Make sure 'pixel_test.png' exists in the root folder.", err);
    }
}

// --- 2. SOCKET CONNECTIONS ---
io.on('connection', (socket) => {
    
    // --- NEW HELPER FUNCTION ---
    // Calculates the top 5 players whenever we need it
    function getLeaderboard() {
        return Object.values(players)
            .sort((a, b) => b.pixelsPainted - a.pixelsPainted)
            .slice(0, 5);
    }

    // 1. PROJECTOR JOIN: Send history AND the current leaderboard
    socket.on('projector_join', () => {
        socket.emit('init_projector', {
            pixels: allPaintedPixels,
            total: allPaintedPixels.length,
            leaderboard: getLeaderboard() // Send the ranks immediately
        });
    });

    // 2. PLAYER JOIN: Add them to the list and broadcast the update
    socket.on('player_join', (username) => {
        players[socket.id] = {
            id: socket.id,
            name: username,
            sector: null, // Don't assign a sector yet!
            pixelsPainted: 0 
        };
        
        io.emit('scoreboard_update', getLeaderboard());

        // If the game hasn't started, tell them to wait
        if (gameState === 'lobby') {
            socket.emit('waiting_in_lobby');
        } else {
            // If they joined late, give them a sector immediately
            assignSectorAndStart(socket);
        }
    });

    socket.on('host_start_game', () => {
        gameState = 'playing';
        console.log("🚀 GAME STARTED BY HOST!");
        
        // Loop through everyone waiting in the lobby and give them their sectors
        for (let socketId in players) {
            const playerSocket = io.sockets.sockets.get(socketId);
            if (playerSocket) assignSectorAndStart(playerSocket);
        }
    });

    // Helper Function to handle sector assignment and history
    function assignSectorAndStart(playerSocket) {
        let assignedSector = null;
        if (unassignedSectors.length > 0) assignedSector = unassignedSectors.shift();
        
        players[playerSocket.id].sector = assignedSector;

        // Find all globally painted pixels that belong specifically to this player's new sector
        let alreadyPainted = [];
        if (assignedSector) {
             alreadyPainted = allPaintedPixels.filter(p => 
                 p.x >= assignedSector.bounds.minX && 
                 p.x < assignedSector.bounds.minX + assignedSector.bounds.width &&
                 p.y >= assignedSector.bounds.minY && 
                 p.y < assignedSector.bounds.minY + assignedSector.bounds.height
             );
        }

        // Send the sector AND the history of that sector
        playerSocket.emit('game_start', { sector: assignedSector, history: alreadyPainted });
    }

    // 3. PIXEL PAINTED: Give points and update
    socket.on('pixel_painted', (data) => {
        const globalKey = `${data.x},${data.y}`;
        if (masterPixelMap.has(globalKey)) return; 
        
        masterPixelMap.add(globalKey); 
        allPaintedPixels.push(data);

        if (players[socket.id]) players[socket.id].pixelsPainted++;

        io.emit('projector_update', data);
        io.emit('scoreboard_update', getLeaderboard()); // Use helper
    });

    // 4. DISCONNECT: Remove them and update
    socket.on('disconnect', () => {
        if (players[socket.id] && players[socket.id].sector) {
            unassignedSectors.push(players[socket.id].sector);
            unassignedSectors.sort((a, b) => a.id - b.id);
        }
        delete players[socket.id];
        
        io.emit('scoreboard_update', getLeaderboard()); // Use helper
    });
});         

// Run the pipeline, THEN start the server
initCanvasData('pixel_test.png').then(() => {
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
});
