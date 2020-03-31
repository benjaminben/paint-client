import React, {useState} from 'react';
import logo from './logo.svg';
import Scene from './Scene';
import { StateProvider } from "./store"
import './App.css';

function App() {
  const ws = new WebSocket('ws://1993.ngrok.io')
  const [message, setMessage] = useState("")

  ws.binaryType = "arraybuffer"
  ws.onmessage = onMessage
  ws.onclose = onClose

  function sendData(message) {
    ws.send(message);
  }

  function onMessage(e) {
    console.log(e.data);
    setMessage(e.data)
  }

  function onClose(e) {
    setMessage("CONNECTION CLOSED (try refresh)")
  }

  return (
    <StateProvider>
      <div className="App">
        <Scene sendData={sendData} />
      </div>
    </StateProvider>
  );
}

export default App;
