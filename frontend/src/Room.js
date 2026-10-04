import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket, deviceName } from './socket';

export default function Room() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    const nickname = sessionStorage.getItem("nickname");
    if (!nickname) { navigate("/"); return; }

    const rejoin = () => {
      socket.emit("join_session", code, `${nickname} (${deviceName})`, (res) => {
        if (!res.ok) navigate("/");
      });
    };

    if (socket.connected) rejoin();
    socket.on("connect", rejoin);
    socket.on("devices_updated", setDevices);
    return () => {
      socket.off("connect", rejoin);
      socket.off("devices_updated", setDevices);
    };
  }, [code, navigate]);

  return (
    <div>
      <h1>Room {code}</h1>
      <h3>Connected devices ({devices.length})</h3>
      <ul>{devices.map((d, i) => <li key={i}>{d}</li>)}</ul>
    </div>
  );
}