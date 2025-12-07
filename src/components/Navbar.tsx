import { useEffect, useState } from "react";
import useActiveSection from "../hooks/useActiveSection";

const Navbar = () => {
  const active = useActiveSection(["hero", "about", "projects", "blog", "contact"]);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "navbar-small" : ""}`}>
      <div className="navbar-inner">
        <a href="#hero" className="navbar-logo">
          Henry Arinaga
        </a>

        <div className="navbar-links">
          <a href="#about" className={active === "about" ? "active" : ""}>About</a>
          <a href="#projects" className={active === "projects" ? "active" : ""}>Projects</a>
          <a href="#blog" className={active === "blog" ? "active" : ""}>Blog</a>
          <a href="#contact" className={active === "contact" ? "active" : ""}>Contact</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
