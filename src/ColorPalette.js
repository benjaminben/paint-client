import React, { useContext } from "react"
import { store } from "./store"

const colors = [
  "salmon",
  "skyblue",
  "forestgreen",
]

export default (props) => {
  const globalState = useContext(store)
  const { dispatch } = globalState
  const { brushColor } = globalState.state
  return(
    <div
      id="ColorPalette"
      style={{
        position: "absolute",
        top: 0, left: 0,
        display: "flex",
      }}>
    { colors.map(c =>
        <span
          key={c}
          onClick={e => dispatch({type: "user:brushColor", payload: c})}
          style={{
            height: "50px", width: "50px", background: c,
            boxSizing: "border-box",
            border: c === brushColor ? "4px solid gold" : "none",
          }} />
      ) }
    </div>
  )
}
