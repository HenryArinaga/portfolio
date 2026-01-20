import { HashRouter, Routes, Route } from "react-router-dom";

import HeroSection from "./sections/HeroSection";
import AboutSection from "./sections/AboutSection";
import ProjectsSection from "./sections/ProjectsSection";
import BlogSection from "./sections/BlogSection";
import FooterSection from "./sections/FooterSection";
import Navbar from "./components/Navbar";
import StarTrail from "./components/StarTrail";

import BlogIndex from "./pages/BlogIndex";
import BlogPostPage from "./pages/BlogPost";
import AdminNewPost from "./pages/AdminNewPost";
import AdminDashboard from "./pages/AdminDashboard";

import "./styles/layout.css";
import "./styles/animations.css";

function HomePage() {
  return (
    <div className="App">
      <StarTrail />
      <Navbar />
      <HeroSection />
      <div className="section-elevation" />
      <AboutSection />
      <div className="section-elevation" />
      <ProjectsSection />
      <div className="section-elevation" />
      <BlogSection />
      <div className="section-elevation" />
      <FooterSection />
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/blog" element={<BlogIndex />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />

        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/new" element={<AdminNewPost />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
