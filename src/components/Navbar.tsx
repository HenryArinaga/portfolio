import { useEffect, useState } from "react";
import { BLOG_SITE_URL } from "../services/blogApi";
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

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav className={`navbar ${scrolled ? "navbar-small" : ""}`} role="navigation" aria-label="Main navigation">
      <div className="navbar-inner">
        <a 
          href="#hero" 
          className="navbar-logo"
          onClick={(e) => handleSmoothScroll(e, "hero")}
          aria-label="Henry Arinaga - Home"
        >
          Henry Arinaga
        </a>
        <div className="navbar-links" role="list">
          <a 
            href="#about" 
            className={active === "about" ? "active" : ""}
            onClick={(e) => handleSmoothScroll(e, "about")}
            aria-current={active === "about" ? "page" : undefined}
            role="listitem"
          >
            About
          </a>
          <a 
            href="#projects" 
            className={active === "projects" ? "active" : ""}
            onClick={(e) => handleSmoothScroll(e, "projects")}
            aria-current={active === "projects" ? "page" : undefined}
            role="listitem"
          >
            Projects
          </a>
          <a 
            href={BLOG_SITE_URL}
            target="_blank"
            rel="noreferrer"
            role="listitem"
          >
            Blog
          </a>
          <a 
            href="#contact" 
            className={active === "contact" ? "active" : ""}
            onClick={(e) => handleSmoothScroll(e, "contact")}
            aria-current={active === "contact" ? "page" : undefined}
            role="listitem"
          >
            Contact
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
