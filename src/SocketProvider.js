import React from "react"



export default ({onMessage, onClose}) => {
	var ws = new WebSocket('ws://1993.ngrok.io');
	function sendData(message) {
		ws.send(message);
	}

	ws.onmessage = onmessage
	ws.onclose = onclose

	return null
}
