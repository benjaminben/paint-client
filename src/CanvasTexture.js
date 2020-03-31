import React, {useRef, useEffect, useState} from "react"

export default ({height, setRef, size, show}) => {
  const canvas = useRef(null)
  let ctx
  let time = 0
  function init() {
    const c = canvas.current
    ctx = c.getContext("2d")

    const tex = new Image()
    tex.onload = () => {
      ctx.drawImage(tex, 0, 0, c.width, c.height)
      // draw()
      // run()
    }
    tex.src = `${process.env.PUBLIC_URL}/barn/textures/Rbarn15_Albedo.png`
  }
  function update() {

  }
  function draw() {

  }
  function run() {
    // time += 0.01
    // update()
    // draw()
    window.requestAnimationFrame(run)
  }
  useEffect(() => {
    init()
    setRef(ctx)
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
