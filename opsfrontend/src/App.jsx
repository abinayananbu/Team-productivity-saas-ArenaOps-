import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import DashBoardPage from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import SpacesPage from "./pages/SpacesPage";
import ProjectDetailsPage from "./pages/ProjectDetailsPage";
import DocsPage from "./pages/DocsPage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/Profile";
import ProjectsPage from "./pages/ProjectsPage";
import IntroductionPage from "./pages/Introduction";
import AllMembers from "./pages/Members";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IntroductionPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashBoardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/spaces"
          element={
            <PrivateRoute>
              <SpacesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <PrivateRoute>
              <ProjectsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/projectdetail/:id"
          element={
            <PrivateRoute>
              <ProjectDetailsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/docs"
          element={
            <PrivateRoute>
              <DocsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/chats"
          element={
            <PrivateRoute>
              <ChatPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/members"
          element={
            <PrivateRoute>
              <AllMembers/>
            </PrivateRoute>
          }
          />
      </Routes>
      
     <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
        style={{ zIndex: 999999 }}
      />
    </BrowserRouter>
  );
}

export default App;
