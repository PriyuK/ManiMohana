import React from "react";
import { useNavigate } from "react-router-dom";

const DelayedLink = ({ to, children, className = "", ...props }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();
    if (window.showAppLoader) window.showAppLoader();
    setTimeout(() => {
      if (window.hideAppLoader) window.hideAppLoader();
      navigate(to);
    }, 2500);
  };

  return (
    <button
      className={className}
      onClick={handleClick}
      {...props}
      style={{ background: "none", border: "none", padding: 0, margin: 0, cursor: "pointer", display: "inline", font: "inherit", color: "inherit" }}
    >
      {children}
    </button>
  );
};

export default DelayedLink; 