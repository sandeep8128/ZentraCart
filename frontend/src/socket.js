import { io } from "socket.io-client";

const socket = io("https://zentracart-backend.onrender.com");

export default socket;