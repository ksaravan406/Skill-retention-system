import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

import "./amplify";
import "./index.css";
import "./Auth.css";
import "./Landing.css";
import "./3d-experience.css";
import App from "./App.jsx";
import { LandingHero3D } from "./components/ThreeSkillCore.jsx";

function LandingPage({ onSignIn, onSignUp }) {
  const [heroView, setHeroView] = useState("3d");

  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <a className="landing-brand" href="#home">
          <span className="brand-mark">S</span>
          <span>Skill<span className="brand-highlight">Retain</span></span>
        </a>
        <div className="landing-nav-actions">
          <button className="landing-signin-link" onClick={onSignIn}>Sign In</button>
          <button className="landing-nav-cta" onClick={onSignUp}>Get Started <span aria-hidden="true">↗</span></button>
        </div>
      </nav>

      <main id="home">
        <section className="landing-hero">
          <div className="hero-copy">
            <div className="hero-pill"><span className="hero-pill-dot" />YOUR PERSONAL 3D SKILL RETENTION PLATFORM</div>
            <h1>Learn it today.<br /><span>Remember it</span><br />tomorrow.</h1>
            <p className="hero-description">Learning something is just the beginning. SkillRetain helps you practice consistently, track what you remember in real-time 3D, and focus on the skills that need your attention.</p>
            <div className="hero-actions">
              <button className="hero-primary-button" onClick={onSignUp}>Start Learning Free <span aria-hidden="true">→</span></button>
              <button className="hero-secondary-button" onClick={onSignIn}>I already have an account</button>
            </div>
            <div className="hero-trust">
              <div className="trust-avatars" aria-hidden="true"><span>S</span><span>L</span><span>R</span></div>
              <p><strong>Learn with purpose in 3D.</strong><br />Build knowledge that lasts.</p>
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-glow" />

            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
              <div className="hero-visual-toggle">
                <button
                  type="button"
                  className={`hero-tab-btn ${heroView === "3d" ? "active" : ""}`}
                  onClick={() => setHeroView("3d")}
                >
                  ✦ 3D Skill Cosmos
                </button>
                <button
                  type="button"
                  className={`hero-tab-btn ${heroView === "preview" ? "active" : ""}`}
                  onClick={() => setHeroView("preview")}
                >
                  ▣ App Preview
                </button>
              </div>
            </div>

            <div className="floating-label floating-label-top">
              <span className="floating-label-icon">↗</span>
              <span><strong>Keep improving</strong><small>One session at a time</small></span>
            </div>

            {heroView === "3d" ? (
              <LandingHero3D onGetStarted={onSignUp} />
            ) : (
              <div className="preview-window">
                <div className="preview-window-top">
                  <div className="preview-dots"><span /><span /><span /></div>
                  <span className="preview-window-label">YOUR LEARNING SPACE</span>
                </div>
                <div className="preview-content">
                  <div className="preview-greeting">
                    <div>
                      <span className="preview-eyebrow">YOUR OVERVIEW</span>
                      <h2>Keep your skills sharp.</h2>
                      <p>Your next step starts here.</p>
                    </div>
                    <div className="preview-profile">S</div>
                  </div>
                  <div className="preview-stat-grid">
                    <div className="preview-stat"><span className="stat-icon purple">◇</span><span className="preview-stat-label">Skills tracked</span><strong>My skills</strong><small>All in one place</small></div>
                    <div className="preview-stat"><span className="stat-icon green">↗</span><span className="preview-stat-label">Daily practice</span><strong>Stay consistent</strong><small>Build your routine</small></div>
                  </div>
                  <div className="preview-retention-card">
                    <div className="retention-heading"><div><span className="preview-eyebrow">YOUR PROGRESS</span><h3>Skill retention</h3></div><span className="retention-badge">Keep growing</span></div>
                    <div className="retention-item"><div className="retention-item-heading"><span className="skill-symbol java-symbol">J</span><span className="retention-skill-name">Java</span><span className="retention-skill-tag">Practice</span></div><div className="retention-track"><div className="retention-fill java-fill" /></div></div>
                    <div className="retention-item"><div className="retention-item-heading"><span className="skill-symbol ds-symbol">D</span><span className="retention-skill-name">Data Structures</span><span className="retention-skill-tag">Review</span></div><div className="retention-track"><div className="retention-fill ds-fill" /></div></div>
                    <div className="retention-item"><div className="retention-item-heading"><span className="skill-symbol py-symbol">P</span><span className="retention-skill-name">Python</span><span className="retention-skill-tag">Learn</span></div><div className="retention-track"><div className="retention-fill py-fill" /></div></div>
                  </div>
                  <div className="preview-tip"><span className="preview-tip-icon">✦</span><p><strong>Your next step</strong><br />Practice, review, and strengthen your knowledge.</p><span className="preview-tip-arrow">→</span></div>
                </div>
              </div>
            )}

            <div className="floating-label floating-label-bottom">
              <span className="bottom-check">✓</span>
              <span><strong>Progress you can track</strong><small>Your learning, organized</small></span>
            </div>
          </div>
        </section>

        <section className="landing-features">
          <div className="features-intro">
            <span className="section-kicker">A BETTER WAY TO LEARN</span>
            <h2>Make every learning session count.</h2>
            <p>Turn what you learn into knowledge you can recall and use.</p>
          </div>
          <div className="feature-grid">
            <article className="feature-card">
              <div className="feature-icon feature-purple">◈</div>
              <h3>Track your skills in 3D</h3>
              <p>Keep your skills organized and see how your knowledge changes over time with interactive 3D retention spheres.</p>
            </article>
            <article className="feature-card">
              <div className="feature-icon feature-green">↻</div>
              <h3>Practice with purpose</h3>
              <p>Test your understanding with skill-focused questions and strengthen what you know.</p>
            </article>
            <article className="feature-card">
              <div className="feature-icon feature-orange">✦</div>
              <h3>Know what to review</h3>
              <p>Use retention insights and recommendations to prioritize your next practice session.</p>
            </article>
          </div>
        </section>

        <section className="landing-bottom-cta">
          <div>
            <span className="section-kicker">YOUR NEXT CHAPTER STARTS HERE</span>
            <h2>Don't just learn. Retain.</h2>
            <p>Build a learning habit that keeps moving you forward.</p>
          </div>
          <button className="hero-primary-button" onClick={onSignUp}>Get Started Free <span aria-hidden="true">→</span></button>
        </section>
      </main>

      <footer className="landing-footer">
        <a className="landing-brand footer-brand" href="#home">
          <span className="brand-mark">S</span>
          <span>Skill<span className="brand-highlight">Retain</span></span>
        </a>
        <span>Learn consistently. Remember confidently.</span>
      </footer>
    </div>
  );
}

function getStoredUsername(user) {
  if (!user) return "Learner";
  const key = `skillretain_username_${user.userId || user.username || "default"}`;
  const saved = localStorage.getItem(key);
  if (saved && saved.trim()) return saved.trim();
  if (user.username && !user.username.includes("-")) {
    return user.username;
  }
  if (user.signInDetails?.loginId) {
    return user.signInDetails.loginId.split("@")[0];
  }
  return "Learner";
}

function AuthenticatedView({ user, signOut, setAuthMode }) {
  const [activePage, setActivePage] = useState("Dashboard");
  const [username, setUsername] = useState(() => getStoredUsername(user));

  const handleUpdateUsername = (newName) => {
    const trimmed = (newName || "").trim();
    if (!trimmed) return;
    const key = `skillretain_username_${user.userId || user.username || "default"}`;
    localStorage.setItem(key, trimmed);
    setUsername(trimmed);
  };

  return (
    <div className="authenticated-app">
      <div className="logout-bar">
        <div
          className="logout-bar-brand"
          onClick={() => setActivePage("Dashboard")}
          style={{ cursor: "pointer" }}
          title="Return to Dashboard"
        >
          <div className="brand-icon">S</div>
          <div>
            <strong>SkillRetain</strong>
            <span>Skill Retention System</span>
          </div>
        </div>
        <div className="logout-bar-actions">
          <button
            type="button"
            className="account-indicator"
            onClick={() => setActivePage("Profile")}
            title={`View profile for @${username}`}
          >
            <span
              className="account-indicator-avatar"
              aria-hidden="true"
            >
              {(username || "U").charAt(0).toUpperCase()}
            </span>
            <span>{username}</span>
          </button>
          <button className="logout-button" onClick={() => { signOut(); setAuthMode(null); }}>
            Log Out
          </button>
        </div>
      </div>
      <App
        userId={user.userId}
        user={user}
        activePage={activePage}
        setActivePage={setActivePage}
        username={username}
        onUpdateUsername={handleUpdateUsername}
      />
    </div>
  );
}

function Root() {
  const [authMode, setAuthMode] = useState(null);

  if (authMode === null) {
    return <LandingPage onSignIn={() => setAuthMode("signIn")} onSignUp={() => setAuthMode("signUp")} />;
  }

  return (
    <Authenticator
      key={authMode}
      initialState={authMode}
      onStateChange={(state) => {
        if (state === "signedOut") setAuthMode(null);
      }}
      components={{
        Header() {
          return (
            <div className="auth-brand">
              <button type="button" className="auth-back-home" onClick={() => setAuthMode(null)}>← Back to home</button>
              <h1>Skill<span>Retain</span></h1>
              <p>Your learning. Your progress. Your edge.</p>
            </div>
          );
        },
      }}
    >
      {({ user, signOut }) => user ? (
        <AuthenticatedView user={user} signOut={signOut} setAuthMode={setAuthMode} />
      ) : null}
    </Authenticator>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode><Root /></React.StrictMode>
);
