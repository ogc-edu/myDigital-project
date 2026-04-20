import Login from "@/components/Login"
import Register from "@/components/Register"
import Dashboard from "@/components/Dashboard"
import { Navigate, Route, Routes } from "react-router-dom"

function App() {
  return (
    <Routes>
      <Route path='/login' element={<Login/>}/>
      <Route path='/register' element={<Register/>}/>
      <Route path='/dashboard' element={<Dashboard/>}/>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
