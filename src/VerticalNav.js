// src/VerticalNav.js
import React from "react";
import "./VerticalNav.css";
import thumbtack from "./thumbtack.svg";

const VerticalNav = () => {
  const links = [
    {
      href: "https://www.atlassian.com/agile/scrum/standups",
      icon: thumbtack,
      alt: "What is a stand up meeting",
    },
    {
      href: "https://www.atlassian.com/agile/project-management",
      icon: thumbtack,
      alt: "Agile Project Management",
    },
    {
      href: "https://www.figma.com/resource-library/daily-stand-up/",
      icon: thumbtack,
      alt: "How to run great daily stand-up meetings",
    },
    {
      href: "https://www.scrum.org/forum/scrum-forum/60148/how-can-i-make-stand-ups-more-engaging-collaborative",
      icon: thumbtack,
      alt: "Make Stand Ups More Engaging & Collaborative",
    },
  ];

  return (
    <nav className="vertical-nav">
      {links.map((link, idx) => (
        <a
          key={idx}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="nav-icon"
          data-tooltip={link.alt}
        >
          <img src={link.icon} alt={link.alt} width="32" height="32" />
        </a>
      ))}
    </nav>
  );
};

export default VerticalNav;
