import { io } from "socket.io-client";

let socket = null;
const SOCKET_API = "http://10.106.78.222:3000"; // Replace with your IP

export const connectSocket = (token) => {
    // 🛑 CRITICAL FIX: If socket object exists, RETURN IT.
    // Do not check .connected here. Let the internal reconnection logic handle connectivity.
    // If you check .connected, you might create a duplicate while the first one is handshake-ing.
    if (socket) {
        // Optional: Update token if it changed
        if (socket.auth.token !== token) {
            socket.auth.token = token;
        }
        
        // If it was manually disconnected, reconnect it
        if (socket.disconnected) {
            socket.connect();
        }
        
        return socket;
    }

    console.log("🔌 Initializing SINGLETON Socket...");

    socket = io(SOCKET_API, {
        transports: ["websocket"], // Force Websocket (no polling)
        reconnection: true,
        reconnectionAttempts: Infinity, // Keep trying forever
        reconnectionDelay: 2000,
        reconnectionDelayMax: 5000,
        timeout: 20000, // Connection timeout
        auth: { token },
        // 🚀 PERFORMANCE TUNING to prevent "Transport Error"
        pingTimeout: 30000,  // Wait 30s before considering connection dead
        pingInterval: 25000, // Send heartbeat every 25s
    });

    socket.on("connect", () => {
        console.log("✅ Socket Connected ID:", socket.id);
    });

    socket.on("disconnect", (reason) => {
        console.log("❌ Socket Disconnected:", reason);
        // If server kicked us, we might need to re-auth, but usually auto-reconnect works
    });

    socket.on("connect_error", (err) => {
        // Reduce log spam
        console.log("⚠️ Socket Connection Error (Retrying...):", err.message);
    });

    return socket;
};

export const getSocket = () => {
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        console.log("🔌 Disconnecting Socket...");
        socket.disconnect();
        socket = null; // Clean up so next login creates fresh instance
    }
};