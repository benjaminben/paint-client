import React, {createContext, useReducer} from "react"

const initialState = {
  brushColor: "black"
}
const store = createContext(initialState)
const { Provider } = store

const StateProvider = ( { children } ) => {
  const [state, dispatch] = useReducer((state, action) => {
    switch(action.type) {
      case "user:brushColor":
        return {...state, brushColor: action.payload}
      default:
        throw new Error()
    }
  }, initialState)

  return <Provider value={{ state, dispatch }}>{ children }</Provider>
}

export { store, StateProvider }
