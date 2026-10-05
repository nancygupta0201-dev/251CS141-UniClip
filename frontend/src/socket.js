import { io } from "socket.io-client";

export const socket = io(process.env.REACT_APP_BACKEND_URL);

export const deviceName =
  sessionStorage.getItem("deviceName") || "Device-" + Math.floor(1000 + Math.random() * 9000);
  sessionStorage.setItem("deviceName", deviceName);