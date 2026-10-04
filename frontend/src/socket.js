import {io} from "socket.io-client";

export const deviceName =
  sessionStorage.getItem("deviceName") || "Device-" + Math.floor(1000 + Math.random() * 9000);
sessionStorage.setItem("deviceName", deviceName);

export const socket = io("http://localhost:8000");