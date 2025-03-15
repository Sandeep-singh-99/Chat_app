import React, { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Setting from "./pages/Setting";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import { Toaster } from "react-hot-toast";
import { useThemeStore } from "./store/useThemeStore";
import { useAuthStore } from "./store/useAuthStore";
import { Loader } from "lucide-react";

export default function App() {
  const { checkAuth, authUser, isCheckingAuth,  onlineUsers } = useAuthStore()
  const { theme } = useThemeStore();

  console.log("onlineUsers", onlineUsers);
  

  useEffect(() => {
    checkAuth()
  },[checkAuth])


  if (isCheckingAuth && !authUser) {
    <div className="flex items-center justify-center h-screen">
      <Loader className="size-10 animate-spin" />
    </div>;
  }
  return (
    <div data-theme={theme}>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={authUser ? <Home /> : <Navigate to={"/login"}/>} />
          <Route path="/login" element={!authUser ? <Login /> : <Navigate to={"/"}/>} />
          <Route path="/signup" element={!authUser ? <Signup /> : <Navigate to={"/"}/>}/>
          <Route path="/profile" element={authUser ? <Profile /> : <Navigate to={"/login"}/>} />
          <Route path="/setting" element={<Setting />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </div>
  );
}
