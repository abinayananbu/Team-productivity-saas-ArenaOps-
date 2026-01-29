import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Login"
import SignupPage from "./pages/Signup";
import DashBoardPage from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import { useDarkMode } from "./hooks/useDarkMode";

function App() {
  useDarkMode()
  
  return (
    <BrowserRouter>
    <Routes>
      <Route path = "/" element = {<LoginPage/>}/>
      <Route path = "/signup" element = {<SignupPage/>}/>
      <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashBoardPage />
            </PrivateRoute>
          }
        />
    </Routes>
    </BrowserRouter>
  )
}

export default App
