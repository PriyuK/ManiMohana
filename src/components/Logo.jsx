import React from "react";
import logo from "../assets/logo.svg";

const Logo = ({ className = "", ...props }) => (
  <img src={logo} alt="Logo" className={className} {...props} />
);

export default Logo; 