import { io } from "socket.io-client";

let socket = null;
let isConnected = false;
const SOCKET_API = "http://192.168.1.4:3000";
// const SOCKET_API = "http://172.24.167.222:3000";


export const connectSocket = (token) => {
    if (socket) return socket;

    socket = io(SOCKET_API, {
        transports: ["websocket"],
        forceNew: false,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        auth: { token },
    });

    socket.on("connect", () => {
        isConnected = true;
        console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
        isConnected = false;
        console.log("Socket disconnected");
    });

    return socket;
};

export function getSocket() {
  return socket;  // return raw socket even if connecting
}
