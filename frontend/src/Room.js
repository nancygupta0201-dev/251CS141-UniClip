import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { socket } from './socket';

export default function Room() {
  const { code } = useParams();
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    socket.emit("get_devices", code, setDevices);
    socket.on("devices_updated", setDevices);
    return () => socket.off("devices_updated", setDevices);
  }, [code]);

  return (
    <div>
      <h1>Room {code}</h1>
      <h3>Connected devices ({devices.length})</h3>
      <ul>{devices.map((d, i) => <li key={i}>{d}</li>)}</ul>
    </div>
  );
}