import profileImg from "../assets/profile.jpg";

const HeroSection = () => {
  return (
    <section className="hero" id="hero">
      <div className="hero-background"></div>

      <div className="hero-content hero-enter">
        <div className="hero-profile">
          <img src={profileImg} alt="Profile" />
        </div>

        <h1 className="hero-name">Henry Arinaga</h1>

        <div className="hero-name-divider"></div>

        <p className="hero-tagline">
          Building backend systems, tools, and educational projects.
        <p> CSUB Computer Science Student </p>
        </p>

        <div className="hero-socials">
        <a href="https://github.com/henryarin" target="_blank" rel="noreferrer">GitHub</a>
        <a href="https://www.linkedin.com/in/henryarinaga/" target="_blank" rel="noreferrer">LinkedIn</a>
        <a href="mailto:Henryarinaga@gmail.com">Email</a>
        </div>

        <div className="hero-scroll-indicator">
          <span>↓ Scroll</span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
