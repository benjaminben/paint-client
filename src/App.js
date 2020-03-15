import React, {useState} from 'react';
import logo from './logo.svg';
import Scene from './Scene';
import './App.css';

function App() {
  const ws = new WebSocket('ws://bb.ngrok.io')
  const [message, setMessage] = useState("")

  ws.binaryType = "arraybuffer"
  ws.onmessage = onMessage
  ws.onclose = onClose

  function sendData(message) {
    ws.send(message);
  }

  function onMessage(e) {
    console.log("New message:", e.data);
    setMessage(e.data)
  }

  function onClose(e) {
    setMessage("CONNECTION CLOSED (try refresh)")
  }

  return (
    <div className="App">
      <Scene sendData={sendData} />
      {
        // <p className="message">{message}</p>
      }
    </div>
  );
}

export default App;
