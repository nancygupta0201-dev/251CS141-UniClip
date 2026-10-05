import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket, deviceName } from './socket';
import './Room.css';
import './Home.css'

const isLink = (text) => {
  try {
    const u = new URL(text.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

export default function Room() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [entries, setEntries] = useState([]);
  const [manual, setManual] = useState("");
  const [error, setError] = useState("");
  const [online, setOnline] = useState(socket.connected);
  const bottomRef = useRef(null);

  useEffect(() => {
    const nickname = sessionStorage.getItem("nickname");
    if (!nickname) { navigate("/"); return; }

    const rejoin = () => {
      setOnline(true);
      socket.emit("join_session", code, `${nickname} (${deviceName})`, (res) => {
        if (!res.ok) navigate("/");
        else setEntries(res.entries);
      });
    };
    const onDisconnect = () => setOnline(false);
    const onEntry = (e) =>
      setEntries((prev) => (prev.some((x) => x.id === e.id) ? prev : [...prev, e]));
    const onDeleted = (id) => setEntries((prev) => prev.filter((x) => x.id !== id));
    const onCleared = () => setEntries([]);

    if (socket.connected) rejoin();
    socket.on("connect", rejoin);
    socket.on("disconnect", onDisconnect);
    socket.on("devices_updated", setDevices);
    socket.on("entry_added", onEntry);
    socket.on("entry_deleted", onDeleted);
    socket.on("entries_cleared", onCleared);
    return () => {
      socket.off("connect", rejoin);
      socket.off("disconnect", onDisconnect);
      socket.off("devices_updated", setDevices);
      socket.off("entry_added", onEntry);
      socket.off("entry_deleted", onDeleted);
      socket.off("entries_cleared", onCleared);
    };
  }, [code, navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries]);

  const send = (text) => {
    if (!text.trim()) return;
    setError("");
    const id = Date.now() + "-" + Math.random().toString(36).slice(2);
    socket.emit(
      "new_entry",
      code,
      { id, content: text.trim(), type: isLink(text) ? "link" : "text" },
      (res) => { if (!res.ok) setError(res.error); }
    );
  };

  const handleSync = async () => {
    setError("");
    try {
      send(await navigator.clipboard.readText());
    } catch {
      setError("Clipboard access blocked. Paste it below instead.");
    }
  };

  const handleManual = () => {
    send(manual);
    setManual("");
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      setError("Couldn't copy. Select the text and copy manually.");
    }
  };

  const handleDelete = (id) => socket.emit("delete_entry", code, id);
  const handleClear = () => socket.emit("clear_entries", code);

  const handleLeave = () => {
  socket.emit("leave_session", code);
  sessionStorage.removeItem("nickname");
  navigate("/");
  };

  return (
    <div className="Room">
      {!online && <div className="banner">Reconnecting...</div>}

      <header className="room-header">
        <h2>Room {code}</h2>
        <button className="btn" onClick={handleLeave}>Leave room</button>
        <div className="devices">
          {devices.map((d, i) => <span className="chip" key={i}>{d}</span>)}
        </div>
      </header>

      <div className="chat">
        {entries.length === 0 && <p className="empty">Nothing synced yet. Copy something and hit Sync.</p>}
        {entries.map((e) => (
          <div className="bubble" key={e.id}>
            <div className="content">
              {e.type === "link"
                ? <a href={e.content} target="_blank" rel="noreferrer">{e.content}</a>
                : e.content}
            </div>
            <div className="meta">
              <small>{e.device} · {new Date(e.time).toLocaleTimeString()}</small>
              <span>
                <button className="mini" onClick={() => handleCopy(e.content)}>Copy</button>
                <button className="mini" onClick={() => handleDelete(e.id)}>Delete</button>
              </span>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {error && <p className="error">{error}</p>}

      <div className="bar">
        <button className="btn" onClick={handleSync}>Sync Clipboard</button>
        <input
          value={manual}
          onChange={(e) => setManual(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleManual()}
          placeholder="Or paste here"
        />
        <button className="btn" onClick={handleManual}>Send</button>
        <button className="btn" onClick={handleClear}>Clear all</button>
      </div>
    </div>
  );
}