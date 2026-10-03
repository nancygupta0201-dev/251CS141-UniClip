import React, { useState, useEffect } from 'react';
import './Home.css';
import { socket } from "./socket"

export default function Home() {
    useEffect(() => {socket.on("connect", () =>console.log(socket.id))}, []);
    useEffect(() => {
        const onReply = d => console.log(d);
        socket.on('test_reply', onReply);
        return () => socket.off('test_reply', onReply);
    }, []);
    return (
    <div className = 'Home'>
        <header className = 'Home-header'>
            UniClip
        </header>
        <p>
            A real-time sync shared clipboard, no more<br></br>sharing links and texts through whatsapp<br></br>or mail and
            losing them!
        </p>
        <div className="buttons-grid">
        <button className="btn" onClick={() => socket.emit('test_event', {msg: 'hi'})}>
          Join Session
        </button>
        <button className="btn">
          Create Session
        </button>
      </div>
    </div>
  );
}
