"use client";
import React, { useEffect, useState } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [navbarTransparent, setNavbarTransparent] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setNavbarTransparent(window.scrollY > 10);
    }
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`navbar ${navbarTransparent ? "transparent" : ""}`}
        id="navbar"
      >
        <ul>
          <li>
            <a href="#flekcuts" id="home">
              FlekCuts
            </a>
          </li>
          <li>
            <a href="#objednat" className="button">
              objednat
            </a>
          </li>
          <li>
            <a href="#services" className="button">
              služby
            </a>
          </li>
        </ul>
      </nav>
      <main>{children}</main>
      <footer className="footer">
        <h2>footer</h2>
      </footer>
      <style jsx>{`
        .navbar {
          position: fixed;
          top: 0;
          width: 100%;
          background-color: black;
          transition: background-color 0.5s;
          z-index: 10;
        }
        .navbar.transparent {
          background-color: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(10px);
        }
        .navbar ul {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 10px;
          justify-content: space-between;
          color: white;
        }
        .navbar li a {
          color: white;
          text-decoration: none;
          padding: 0 15px;
        }
        main {
          margin-top: 3.8rem; /* navbar height */
          padding: 20px;
        }
        .footer {
          background-color: black;
          color: white;
          text-align: center;
          padding: 10px;
          margin-top: 50px;
        }
      `}</style>
    </>
  );
}
