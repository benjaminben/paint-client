import React, { useContext } from "react"
import * as THREE from "three"
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js"
import CanvasTexture from "./CanvasTexture"
import ColorPalette from "./ColorPalette"
import { store } from "./store"

class Scene extends React.Component {
	static contextType = store

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
		this.castRay = this.castRay.bind(this)
		this.updateUser = this.updateUser.bind(this)
		this.updateTexture = this.updateTexture.bind(this)

		this.init = this.init.bind(this)
		this.run = this.run.bind(this)
		this.setTextureContext = this.setTextureContext.bind(this)
	}

	componentDidMount() {
		this.bindUserEvents()
	}

	setTextureContext(ctx) {
		this.textureCtx = ctx
		this.textureCanvas = ctx.canvas
		this.init()
	}

	init() {
		var camera, scene, renderer
		var geometry, material, mesh, texture
		var { canvas } = this.refs
		var { width, height } = this.state

		camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 10000)
		camera.position.z = 2000
		camera.position.y = 500

		scene = new THREE.Scene()

		texture = new THREE.CanvasTexture(this.textureCanvas)
		geometry = new THREE.BoxGeometry( 0.5, 0.5, 0.5 )
		material = new THREE.MeshBasicMaterial({
			map: texture,
		})

		// mesh = new THREE.Mesh( geometry, material )
		// mesh.rotation.y = 1
		// scene.add( mesh )

		renderer = new THREE.WebGLRenderer( { canvas, antialias: true } )
		renderer.setSize( width, height )

		this.camera = camera
		this.scene = scene
		this.renderer = renderer
		this.mesh = mesh
		this.texture = texture
		this.raycaster = new THREE.Raycaster()
		this.user = new THREE.Vector2()

		var loader = new OBJLoader()
		loader.load(
			`${process.env.PUBLIC_URL}/barn/barn.obj`,
			object => {
				object.traverse(child => {
					if ( child instanceof THREE.Mesh ) {
						child.material.map = texture;
						// access other properties of material
					}
				})
				// object.scale.x = 0.01
				// object.scale.y = 0.01
				// object.scale.z = 0.01
				// object.rotation.y = 101
				scene.add(object)
				this.barn = object
			}
		)

		var light = new THREE.PointLight(0xffffff, 1, 0);
		light.position.set(camera.position.x, camera.position.y, camera.position.z);
		light.lookAt(new THREE.Vector3(0,0,0))
		scene.add(light);
		var ambientLight = new THREE.AmbientLight(0x111111);
		scene.add(ambientLight);

		this.run()
		this.resize()
		window.addEventListener("resize", this.resize)
	}

	updateUser(userEvent) {
		this.user.x = (userEvent.clientX / this.refs.canvas.width) * 2 - 1
		this.user.y = (userEvent.clientY / this.refs.canvas.height) * 2 - 1

		this.castRay()
	}

	updateTexture(uv) {
		// console.log(uv)
		const ctx = this.textureCtx
		const { canvas } = ctx
		const { brushColor } = this.context.state
		const x = uv.x*canvas.width
		const y = uv.y*canvas.height
		ctx.beginPath()
		ctx.arc(x, y, 2, 0, 2 * Math.PI, false)
		ctx.fillStyle = brushColor
		ctx.fill()
	}

	castRay() {
		const { raycaster, camera, scene, user } = this
		this.raycaster.setFromCamera( user, camera )
		const intersects = raycaster.intersectObjects( this.barn.children )
		for (var i = 0; i < intersects.length; i++) {
			const { uv, face, faceIndex } = intersects[i]
			console.log(uv, face)
			// face.color.setRGB(1,1,1)
			this.updateTexture(uv)
		}
	}

	run() {
		const { barn, run, mesh, scene, camera, renderer } = this
		window.requestAnimationFrame( run )
		// if (barn) {barn.rotation.y += 0.01}
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

		this.updateUser(e)
		sendData(Factory(formatClientEvent(e)))

		this.refs.canvas.addEventListener("mousemove", mouseMove)
		window.addEventListener("mouseup", mouseUp)
	}

	mouseMove(e) {
		const { sendData } = this.props
		const { Factory, formatClientEvent, mouseMove, mouseUp } = this
		this.updateUser(e)
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
		this.updateUser(e.targetTouches[0])
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
		const {setTextureContext} = this
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
						setRef={setTextureContext}
						size={this.textureSize}
						height={height} />
					<ColorPalette />
			</div>
		)
	}
}

export default Scene
