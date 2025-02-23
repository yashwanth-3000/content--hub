"use client";

import React, { useEffect } from "react";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";

const About = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouseX.set(event.clientX);
      mouseY.set(event.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const background = useMotionTemplate`radial-gradient(800px at ${mouseX}px ${mouseY}px, rgba(103,232,249,0.1), rgba(103,232,249,0.05) 50%, transparent 80%)`;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#111827",
        fontFamily: "monospace",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style jsx global>{`
        .crt-effect::after {
          content: " ";
          display: block;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          background: linear-gradient(
              rgba(18, 16, 16, 0) 50%,
              rgba(0, 0, 0, 0.25) 50%
            ),
            linear-gradient(
              90deg,
              rgba(255, 0, 0, 0.06),
              rgba(0, 255, 0, 0.02),
              rgba(0, 0, 255, 0.06)
            );
          z-index: 999;
          pointer-events: none;
          background-size: 100% 2px, 3px 100%;
        }
        .glitch-tagline {
          position: relative;
          color: rgba(103,232,249,0.8);
          font-size: 1.125rem;
          margin-top: 0.5rem;
          display: inline-block;
        }
        .glitch-tagline::before,
        .glitch-tagline::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          opacity: 0.4;
        }
        .glitch-tagline::before {
          left: 1px;
          text-shadow: -1px 0 red;
          clip: rect(10px, 9999px, 40px, 0);
          animation: glitch-animation 2.5s infinite linear alternate-reverse;
        }
        .glitch-tagline::after {
          left: -1px;
          text-shadow: -1px 0 blue;
          clip: rect(10px, 9999px, 40px, 0);
          animation: glitch-animation2 3s infinite linear alternate-reverse;
        }
        @keyframes glitch-animation {
          0% { clip: rect(10px, 9999px, 40px, 0); }
          20% { clip: rect(12px, 9999px, 38px, 0); }
          40% { clip: rect(10px, 9999px, 40px, 0); }
          60% { clip: rect(11px, 9999px, 37px, 0); }
          80% { clip: rect(10px, 9999px, 40px, 0); }
          100% { clip: rect(10px, 9999px, 40px, 0); }
        }
        @keyframes glitch-animation2 {
          0% { clip: rect(10px, 9999px, 40px, 0); }
          20% { clip: rect(12px, 9999px, 38px, 0); }
          40% { clip: rect(10px, 9999px, 40px, 0); }
          60% { clip: rect(11px, 9999px, 37px, 0); }
          80% { clip: rect(10px, 9999px, 40px, 0); }
          100% { clip: rect(10px, 9999px, 40px, 0); }
        }
      `}</style>

      <div className="crt-effect" style={{ minHeight: "100%" }}>
        <motion.div className="absolute inset-0 opacity-20" style={{ background }} />

        <div className="container mx-auto px-4 py-16 relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              fontSize: "3rem",
              fontWeight: "700",
              color: "#67e8f9",
              marginBottom: "1rem",
            }}
          >
            About This Project
          </motion.h1>
          <motion.p
            className="glitch-tagline"
            data-text="Crafted with passion and precision."
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              fontSize: "1.125rem",
              color: "rgba(103,232,249,0.8)",
              marginBottom: "2rem",
            }}
          >
            Crafted with passion and precision.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{
              display: "grid",
              gap: "2rem",
              color: "#67e8f9",
              lineHeight: "1.6",
              fontSize: "1rem",
            }}
          >
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "1rem" }}>
                How We Did It
              </h2>
              <p>
                Our project was built using cutting-edge AI technologies and a deep passion for design and
                user experience. We integrated powerful libraries such as{" "}
                <strong>Framer Motion</strong> for fluid animations and{" "}
                <strong>Lucide Icons</strong> for modern, scalable iconography. Every component—from the interactive,
                mouse-responsive background to the retro-inspired glitch text effects—was carefully designed to create an engaging digital experience.
              </p>
            </div>

            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "1rem" }}>
                What We Wanted to Include
              </h2>
              <p>
                Our vision was to combine functionality with striking aesthetics. We set out to include:
              </p>
              <ul style={{ listStyle: "disc", paddingLeft: "1.5rem", marginTop: "1rem" }}>
                <li>Dynamic, mouse-reactive backgrounds for an immersive experience</li>
                <li>Glitch text effects that add a retro-futuristic vibe</li>
                <li>Smooth, responsive animations to guide user interaction</li>
                <li>Modern iconography and a bold color palette to spark creativity</li>
                <li>
                  Integrated{" "}
                  <a
                    href="/"
                    style={{ color: "#FF4136", textDecoration: "underline" }}
                  >
                    Calendar Page
                  </a>{" "}
                  for scheduling and planning content.
                </li>
              </ul>
            </div>

            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "1rem" }}>
                Our Vision
              </h2>
              <p>
                We believe in the fusion of creativity and technology to transform digital experiences.
                By harnessing the power of AI-driven design and innovative development, our goal is to empower users
                with tools that are as visually captivating as they are functionally robust. This project is a step toward
                redefining content creation and inspiring a new wave of digital innovation.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;
