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
          Shoot for the stars, one commit at a time
        </p>

        <div className="hero-socials">
          <span>[GitHub]</span>
          <span>[LinkedIn]</span>
          <span>[Email]</span>
          <span>[Discord]</span>
        </div>

        <div className="hero-scroll-indicator">
          <span>↓ Scroll</span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
