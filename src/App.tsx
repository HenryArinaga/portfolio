import HeroSection from './sections/HeroSection';
import AboutSection from './sections/AboutSection';
import ProjectsSection from './sections/ProjectsSection';
import BlogSection from './sections/BlogSection';
import FooterSection from './sections/FooterSection';
import Navbar from "./components/Navbar";
import StarTrail from "./components/StarTrail";
import './styles/layout.css';
import "./styles/animations.css";

function App() {
  return (
    <div className="App">
      <StarTrail />
      <Navbar />
      <HeroSection />
      <div className="section-elevation"></div>
      <AboutSection />
      <div className="section-elevation"></div>
      <ProjectsSection />
      <div className="section-elevation"></div>
      <BlogSection />
      <div className="section-elevation"></div>
      <FooterSection />
    </div>
  );
}

export default App;
