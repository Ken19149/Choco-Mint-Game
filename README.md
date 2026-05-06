# Choco-Mint Canvas Rush 🍃🍫

A real-time, gamified multiplayer canvas born from the intersection of biology, art, and network sockets. It is an exploration into chemesthesis, empathy, and how we perceive the things we consume. 

## The Concept
Mint chocolate is a polarizing anomaly. Instead of attempting to change someone's biological taste buds, this project translates the physical sensation of the flavor into interactive mobile mechanics. It is the trigeminal nerve, gamified:
* **Mint (Chemesthesis / Cooling):** Requires a sustained, 1-second "freeze" hold—watching an icy progress bar rise to activate the TRPM8 receptors visually.
* **Chocolate (Friction / Melting):** Requires rapid triple-tapping to simulate the tactile friction and warmth of melting cocoa butter.

## The Architecture
I prefer to rely less on abstracted platforms and more on local, comprehensive solutions that I can control. 
* **Backend:** Node.js, Express, and Socket.io handling stateful memory, live leaderboards, and a coordinated auto-fill sequence.
* **Frontend:** HTML5 Canvas and Vanilla JS, featuring a responsive grid, touch-event listeners, and a custom particle FX engine that floats above the interactive layer.
* **Hosting:** A Debian container hosted via Proxmox. Access is routed entirely through a local network via SSH and port forwarding.

## The Art 
The master pixel art was manually designed with the limited Choco-Mint palette, ensuring the aesthetic survives the compression of a 25x24 grid. 

## To Run Locally
1. Clone the repository.
2. Run `npm install`.
3. Ensure the `pixel_test.png` is in the root directory.
4. Run `node server.js`.
5. Connect your device to the forwarded port. The host controls the lobby pacing and the final canvas reveal through the `/projector.html` dashboard.
