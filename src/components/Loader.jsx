import React from "react";
import "./Loader.css";

const Loader = () => {
  return (
    <div className="resin-loader-overlay">
      <div className="swirl-svg-wrapper">
        <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="swirl-teal" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2ad1c7" />
              <stop offset="60%" stopColor="#1b8e99" />
              <stop offset="100%" stopColor="#176d7e" />
            </radialGradient>
            <linearGradient id="swirl-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffd700" />
              <stop offset="100%" stopColor="#ffb300" />
            </linearGradient>
          </defs>
          {/* Main swirl */}
          <path d="M100,30
            C150,30 170,80 120,100
            C70,120 60,170 100,170
            C140,170 170,130 100,100
            C30,70 60,30 100,30Z"
            fill="url(#swirl-teal)"
            stroke="#0e5e6f"
            strokeWidth="3"
          />
          {/* Gold accent */}
          <path d="M120,60
            Q140,90 110,110
            Q90,120 100,140"
            fill="none"
            stroke="url(#swirl-gold)"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.8"
          />
        </svg>
      </div>
      <p className="resin-loader-text">Crafting your resin art...</p>
    </div>
  );
};

export default Loader;

// Helper to show loader directly in body
export function showGlobalLoader() {
  const loaderDiv = document.createElement("div");
  loaderDiv.id = "global-resin-loader";
  document.body.appendChild(loaderDiv);
  ReactDOM.render(<Loader />, loaderDiv);
} 