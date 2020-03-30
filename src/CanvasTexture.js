import React, {useRef, useEffect, useState} from "react"

export default ({height, setRef, size, show}) => {
  const canvas = useRef(null)
  let ctx
  let circle = {}
  let time = 0
  function init() {
    const c = canvas.current
    ctx = c.getContext("2d")
    circle.cx = c.width / 2
    circle.cy = c.height / 2
    circle.r = 10
    circle.fill = "green"

    draw()

    run()
  }
  function update() {
    const c = canvas.current
    circle.cx = Math.sin(time) * c.width / 2 + c.width / 2
  }
  function draw() {
    const c = canvas.current
    ctx.clearRect(0, 0, c.width, c.height)

    ctx.fillStyle = "red"
    ctx.fillRect(0,0,c.width,c.height)

    ctx.beginPath()
    ctx.arc(circle.cx, circle.cy, circle.r, 0, 2 * Math.PI, false)
    ctx.fillStyle = circle.fill
    ctx.fill()
  }
  function run() {
    time += 0.01
    update()
    draw()
    window.requestAnimationFrame(run)
  }
  useEffect(() => {
    init()
    setRef(ctx.canvas)
  }, [])
  return(
    <canvas
      ref={canvas}
      style={{
        display: show ? "block" : "none",
        position: "absolute",
        top: height, left: 0,
        background: "lightblue",
      }}
      width={size} height={size} />
  )
}
