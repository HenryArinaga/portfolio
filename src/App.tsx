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

import "./styles/layout.css";
import "./styles/animations.css";
import "./styles/utilities.css";

function HomePage() {
  return (
    <div className="App">
      <StarTrail />
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <div className="section-elevation" />
        <AboutSection />
        <div className="section-elevation" />
        <ProjectsSection />
        <div className="section-elevation" />
        <BlogSection />
        <div className="section-elevation" />
      </main>
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
      </Routes>
    </HashRouter>
  );
}

export default App;
