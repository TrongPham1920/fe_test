import { io } from "socket.io-client";

// const socket = io("https://test-caro-1.onrender.com");
const socket = io("http://localhost:5000");

export default socket;
