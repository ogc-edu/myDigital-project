import Login from "@/components/Login"
import Register from "@/components/Register"
import { Navigate, Route, Routes } from "react-router-dom"

function App() {
  return (
    <Routes>
      <Route path='/login' element={<Login/>}/>
      <Route path='/register' element={<Register/>}/>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
