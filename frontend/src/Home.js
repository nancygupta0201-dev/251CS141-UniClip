import React, { useState, useEffect } from 'react';
import './Home.css';
import { socket, deviceName } from "./socket";
import { useNavigate } from 'react-router-dom';

export default function Home() {
  useEffect(() => {socket.on("connect", () => console.log(socket.id))}, []);

  const [code, setCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [mode, setMode] = useState(null); // null | "create" | "join"

  const navigate = useNavigate();

  const label = () => `${nickname.trim()} (${deviceName})`;

  const handleCreate = () => {
    if (!nickname.trim()) return;
    socket.emit("create_session", label(), (res) => {
      navigate(`/room/${res.code}`);
    });
  };

  const handleJoin = () => {
    if (!nickname.trim()) return;
    socket.emit("join_session", code, label(), (res) => {
      if (res.ok) navigate(`/room/${res.code}`);
      else console.log(res.error);
    });
  };

  return (
    <div className='Home'>
      <header className='Home-header'>
        UniClip
      </header>
      <p>
        A real-time sync shared clipboard, no more<br></br>sharing links and texts through whatsapp<br></br>or mail and
        losing them!
      </p>
      <div className="buttons-grid">

        <button className="btn" onClick={() => setMode("join")}>
          Join Session
        </button>

        <button className="btn" onClick={() => setMode("create")}>
          Create Session
        </button>

        {mode && (
          <div className="overlay">
            <div className="modal">
              <h3>{mode === "join" ? "Join session" : "Create session"}</h3>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Your nickname"
                maxLength={20}
              />
              {mode === "join" && (
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="4-digit code"
                  maxLength={4}
                />
              )}
              <div>
                <button className="btn" onClick={mode === "join" ? handleJoin : handleCreate}>
                  {mode === "join" ? "Join" : "Create"}
                </button>
                <button className="btn" onClick={() => setMode(null)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}