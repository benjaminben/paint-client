import React from "react"
import * as THREE from "three"
import CanvasTexture from "./CanvasTexture"

class Scene extends React.Component {
	constructor(props) {
		super(props)

		const renderTexturePreview = true
		this.textureSize = 256

		this.state = {
			width: window.innerWidth,
			height: window.innerHeight - (renderTexturePreview ? this.textureSize : 0),
			renderTexturePreview,
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
		this.calcYInset = this.calcYInset.bind(this)

		this.init = this.init.bind(this)
		this.run = this.run.bind(this)
		this.setTextureRef = this.setTextureRef.bind(this)
	}

	componentDidMount() {
		this.bindUserEvents()
	}

	setTextureRef(r) {
		console.log("SETTING TEX", r)
		this.canvasTexture = r
		this.init()
	}

	init() {
		var camera, scene, renderer
		var geometry, material, mesh, texture
		var { canvas } = this.refs
		var { width, height } = this.state

		camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 10)
		camera.position.z = 1

		scene = new THREE.Scene()

		texture = new THREE.CanvasTexture(this.canvasTexture)
		geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 )
		material = new THREE.MeshBasicMaterial({
			map: texture,
		})

		mesh = new THREE.Mesh( geometry, material )
		mesh.rotation.y = 1
		scene.add( mesh )

		renderer = new THREE.WebGLRenderer( { canvas, antialias: true } )
		renderer.setSize( width, height )

		this.camera = camera
		this.scene = scene
		this.renderer = renderer
		this.mesh = mesh
		this.texture = texture

		this.run()
		this.resize()
		window.addEventListener("resize", this.resize)
	}

	run() {
		const { run, mesh, scene, camera, renderer } = this
		window.requestAnimationFrame( run )
		// mesh.rotation.x += 0.01
		// mesh.rotation.y += 0.02
		// console.log(this.texture)
		this.texture.needsUpdate = true
		renderer.render( scene, camera )
	}

	calcYInset() {
		return this.state.renderTexturePreview ? this.textureSize : 0
	}

	resize(e) {
		const { canvas } = this.refs
		const width = window.innerWidth
		const height = window.innerHeight - this.calcYInset()
		this.setState({width, height})
		this.camera.aspect = width / height
		this.camera.updateProjectionMatrix()
		this.renderer.setSize(width, height)
	}

	Factory(buffer) {
		// return new Blob([JSON.stringify(buffer)], {type: "application/json"})
		return buffer
	}

	formatClientEvent(c) {
		const {canvas} = this.refs

		const buffer = new ArrayBuffer(8)
		// const clientXSlot = new Float32Array(buffer, 0, 0.1)
		const clientXSlot = new Float32Array(buffer, 0)
		const clientYSlot = new Float32Array(buffer, 4)
		clientXSlot[0] = c.clientX / canvas.width
		clientYSlot[0] = c.clientY / canvas.height
		// const clientXSlot = new Float32Array(buffer, 0, c.clientX / canvas.width)
		// const clientYSlot = new Float32Array(buffer, 4, c.clientY / canvas.height)
		// const intSlot = new Int32Array(buffer, 4, 1)
		// const uintSlot = new Uint32Array(buffer, 8, 1)

		const scope = new Uint8Array(buffer)

		return scope
	}

	bindUserEvents() {
		const {canvas} = this.refs
		canvas.onmousedown = this.mouseDown
		canvas.ontouchstart = this.touchStart
	}

	mouseDown(e) {
		const { sendData } = this.props
		const { Factory, formatClientEvent, mouseMove, mouseUp } = this

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
		const {width, height, renderTexturePreview} = this.state
		const {setTextureRef} = this
		return(
			<div className="scene">
				<canvas ref="canvas"
					width={width}
					height={height}
					style={{
						position: "absolute",
						top: 0, left: 0,
						width: width, height: height,
						background: "black"}} />
					<CanvasTexture
						show={renderTexturePreview}
						setRef={setTextureRef}
						size={this.textureSize}
						height={height} />
			</div>
		)
	}
}

export default Scene
