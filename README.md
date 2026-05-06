# Choco-Mint Canvas Rush 🍃🍫

A real-time, gamified multiplayer canvas designed to hack the trigeminal nerve and simulate the biological sensation of eating mint chocolate. Built as a creative exploration of sensory perception, empathy, and chemesthesis.

## The Concept
Mint chocolate is a polarizing flavor. Instead of trying to change taste buds, this project translates the biological sensation of the flavor into interactive mechanics. 
* **Mint (Chemesthesis / Cooling):** Requires a sustained 1-second "freeze" hold to activate the TRPM8 receptors visually.
* **Chocolate (Friction / Melting):** Requires rapid triple-tapping to simulate the physical friction and warmth of melting cocoa butter.

## Tech Stack
* **Backend:** Node.js, Express, Socket.io (Stateful memory, Leaderboards, Auto-fill reveals)
* **Frontend:** HTML5 Canvas, Vanilla JS (Responsive grid, Touch-event listeners, Particle FX engine)
* **Data Pipeline:** ImageMagick (Pre-processing 25x24 grids with a strict 9-color hex palette)
* **Hosting environment:** Proxmox LXC container (Debian) exposed via local network.

## The Art Pipeline
To maintain the visual aesthetic, the image used a limited Choco-Mint palette with light, base, and dark tone (Mint, Cocoa, and Neutrals).

## Local Setup & Hosting
1. Clone the repository.
2. Run `npm install` to grab Express, Socket.io, and Jimp.
3. Place a `pixel_test.png` (25x24px) in the root directory.
4. Run `node server.js`.
5. Connect devices to `http://<your-local-ip>:3000`. The host controls the lobby and the final canvas reveal via the `/projector.html` dashboard.
