import React, {createRef} from "react"

class Scene extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			width: 0,
			height: 0,
		}

		this.Factory = this.Factory.bind(this)
		this.formatClientEvent = this.formatClientEvent.bind(this)
		this.bindUserEvents = this.bindUserEvents.bind(this)
		this.mouseDown = this.mouseDown.bind(this)
		this.mouseMove = this.mouseMove.bind(this)
		this.mouseUp = this.mouseUp.bind(this)
		this.touchStart = this.touchStart.bind(this)
		this.touchMove = this.touchMove.bind(this)
		this.touchEnd = this.touchEnd.bind(this)
		this.resize = this.resize.bind(this)
	}

	componentDidMount() {
		this.bindUserEvents()
		this.resize()
		window.addEventListener("resize", this.resize)
	}

	resize(e) {
		const {canvas} = this.refs
		const { width, height } = canvas.getBoundingClientRect()
		console.log(canvas, width, height)
		this.setState({width, height})
	}
 
	Factory(buffer) {
		return new Blob([JSON.stringify(buffer)], {type: "application/json"})
	}

	formatClientEvent(c) {
		const {canvas} = this.refs
		return {
			u: c.clientX / canvas.width,
			v: c.clientY / canvas.height,
		}
	}

	bindUserEvents() {
		const {canvas} = this.refs
		canvas.onmousedown = this.mouseDown
		canvas.ontouchstart = this.touchStart
	}

	mouseDown(e) {
		const { sendData } = this.props
		const { Factory, formatClientEvent, mouseMove, mouseUp } = this
		
		console.log(this.props)

		sendData(Factory(formatClientEvent(e)))
		
		this.refs.canvas.addEventListener("mousemove", mouseMove)
		window.addEventListener("mouseup", mouseUp)
	}
	
	mouseMove(e) {
		const { sendData } = this.props
		const { Factory, formatClientEvent, mouseMove, mouseUp } = this

		sendData(Factory(formatClientEvent(e)))
	}

	mouseUp(e) {
		const { sendData } = this.props
		const { Factory, formatClientEvent, mouseMove, mouseUp } = this
		
		this.refs.canvas.removeEventListener("mousemove", mouseMove)
		window.removeEventListener("mouseup", mouseUp)
	}

	touchStart(e) {
		const { sendData } = this.props
		const { Factory, formatClientEvent, touchMove, touchEnd } = this

		sendData(Factory(formatClientEvent(e.targetTouches[0])))
		this.refs.canvas.addEventListener("touchmove", touchMove)
		window.addEventListener("touchend", touchEnd)
	}
	
	touchMove(e) { 
		const { sendData } = this.props
		const { Factory, formatClientEvent } = this
		sendData(Factory(formatClientEvent(e.targetTouches[0])))
	}

	touchEnd(e) {
		const {canvas} = this.refs
		canvas.removeEventListener("touchmove", this.touchMove)
		window.removeEventListener("touchend", this.touchEnd)
	}

	render() {
		const {width, height} = this.state
		return(
			<canvas ref="canvas"
				width={width}
				height={height}
				style={{
					position: "absolute",
					top: 0, left: 0,
					width: "100%", height: "0px",
					paddingBottom: "56.25%",
					background: "black"}} />
		)
	}
}

export default Scene