import React, { useState } from 'react';
import './Home.css';

export default function Home() {
  return (
    <div className = 'Home'>
        <header className = 'Home-header'>
            UniClip
        </header>
        <p>
            <i>A real-time sync shared clipboard, no more<br></br>sharing links and texts through whatsapp<br></br>or mail and
            losing them!</i>
        </p>
        <div className="buttons-grid">
        <button className="btn">
          Join Session
        </button>
        <button className="btn">
          Create Session
        </button>
      </div>
    </div>
  );
}
