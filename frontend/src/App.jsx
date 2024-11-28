import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { UserProvider } from "./UserContext";
import Navbar from "./Navbar";
import Home from "./Home";
import Login from "./Login";
import Signup from "./Signup";
import Profile from './Profile';
import Threads from './Threads';
import PostsAndComments from './PostsAndComments';

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/community/:id/threads" element={<Threads />} />
          <Route path="/thread/:id/posts" element={<PostsAndComments />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
