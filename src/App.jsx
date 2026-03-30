import { useState } from 'react'
import {Signup} from "./components/Signup.jsx";


function App() {
  const [count, setCount] = useState(0)

  return (
      <div>
          <Signup/>
      </div>
  )
}

export default App
