"use client";

import React, { useEffect, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "framer-motion";
import {
  Brain,
  Twitter,
  Stars,
  ArrowRight,
  ArrowLeft,
  Instagram,
  Linkedin,
  RefreshCw,
  Calendar,
} from "lucide-react";
import Link from "next/link";

const Hero = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const progress = useMotionValue(0);
  const animatedGradient = useTransform(progress, [0, 1], ["20%", "80%"]);
  const [selectedPlatform, setSelectedPlatform] = useState<
    "twitter" | "instagram" | "linkedin"
  >("twitter");

  useEffect(() => {
    const handleMouseMove = ({ clientX, clientY }: MouseEvent) => {
      mouseX.set(clientX);
      mouseY.set(clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const background = useMotionTemplate`radial-gradient(800px at ${mouseX}px ${mouseY}px, rgba(103,232,249,0.1), rgba(103,232,249,0.05) 50%, transparent 80%)`;

  const platformDetails = {
    twitter: {
      icon: Twitter,
      color: "#1DA1F2",
      analysis: [
        { label: "Tone:", value: "Provocative/Questioning" },
        { label: "Structure:", value: "Threads (3-5 tweets)" },
        { label: "Emoji Use:", value: "🔥 ➔ 🤔 ➔ 💡" },
      ],
    },
    instagram: {
      icon: Instagram,
      color: "#E1306C",
      analysis: [
        { label: "Aesthetic:", value: "Vibrant/Curated" },
        { label: "Hashtags:", value: "5-10 relevant tags" },
        { label: "Engagement:", value: "High visual focus" },
      ],
    },
    linkedin: {
      icon: Linkedin,
      color: "#0A66C2",
      analysis: [
        { label: "Tone:", value: "Professional/Insightful" },
        { label: "Structure:", value: "Long-form posts" },
        { label: "Keywords:", value: "Industry-specific" },
      ],
    },
  };

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
        @keyframes glow {
          0% { opacity: 0.3; }
          50% { opacity: 0.6; }
          100% { opacity: 0.3; }
        }
        @keyframes pulse {
          0% { border-color: rgba(34,211,238,0.3); }
          50% { border-color: rgba(34,211,238,0.6); }
          100% { border-color: rgba(34,211,238,0.3); }
        }
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


        <div className="container mx-auto px-4 h-screen flex items-center relative z-10">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h1
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "700",
                  lineHeight: "1.2",
                  color: "#67e8f9",
                }}
              >
                <span
                  style={{
                    background: "linear-gradient(to right, #67e8f9, #22d3ee)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  AI-Powered
                </span>
                <br />
                <span style={{ color: "#67e8f9" }}>
                  Cross-Platform Content Generation
                </span>
              </h1>

              <p
                className="glitch-tagline"
                data-text="Empower your content strategy with intelligent automation."
              >
                Empower your content strategy with intelligent automation.
              </p>

              {/* CTA Section */}
              <div className="flex flex-col sm:flex-row gap-2 mt-8">
                <motion.a
                  href="/choose-post-type"
                  className="relative overflow-hidden group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onHoverStart={() => progress.set(1)}
                  onHoverEnd={() => progress.set(0)}
                  style={{
                    padding: "0.75rem 1.5rem",
                    textDecoration: "none",
                    position: "relative",
                    borderRadius: "2rem",
                  }}
                >
                  <motion.div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to right, rgba(103,232,249,0.2), rgba(34,211,238,0.1))",
                      backgroundPositionX: animatedGradient,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: "1px",
                      backgroundColor: "#111827",
                      borderRadius: "2rem",
                    }}
                  />
                  <span
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      color: "#67e8f9",
                      fontSize: "1rem",
                    }}
                  >
                    <Stars className="h-5 w-5" style={{ color: "#67e8f9" }} />
                    Start Creating
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <ArrowRight className="h-5 w-5" style={{ color: "#67e8f9" }} />
                    </motion.div>
                  </span>
                </motion.a>

                <motion.a
                  href="/choose-analysing-profile"
                  className="relative overflow-hidden group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: "0.75rem 1.5rem",
                    textDecoration: "none",
                    position: "relative",
                    borderRadius: "2rem",
                  }}
                >
                  <motion.div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to right, rgba(103,232,249,0.2), rgba(34,211,238,0.1))",
                      backgroundPositionX: animatedGradient,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: "1px",
                      backgroundColor: "#111827",
                      borderRadius: "2rem",
                    }}
                  />
                  <span
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      color: "#67e8f9",
                      fontSize: "1rem",
                    }}
                  >
                    <RefreshCw className="h-5 w-5" style={{ color: "#67e8f9" }} />
                    Analysing Your Profile
                  </span>
                </motion.a>
              </div>

              {/* Big Button (Modified Only) */}
              <div className="mt-2">
                <motion.a
                  href="/social-media-timeline"
                  className="relative overflow-hidden group block w-full"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onHoverStart={() => progress.set(1)}
                  onHoverEnd={() => progress.set(0)}
                  style={{
                    padding: "0.75rem 1.5rem",
                    textDecoration: "none",
                    position: "relative",
                    borderRadius: "2rem",
                    boxShadow: "0 0 15px rgba(103,232,249,0.3)",
                  }}
                >
                  <motion.div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to right, rgba(103,232,249,0.2), rgba(34,211,238,0.1))",
                      backgroundPositionX: animatedGradient,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: "1px",
                      backgroundColor: "#111827",
                      borderRadius: "2rem",
                    }}
                  />
                  <span
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.75rem",
                      color: "#67e8f9",
                      fontSize: "1rem",
                    }}
                  >
                    {/* Animated Calendar Icon */}
                    <motion.span
                      whileHover={{ rotate: 15, scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Calendar className="h-5 w-5" style={{ color: "#67e8f9" }} />
                    </motion.span>
                    Genratre your content calnder
                    {/* Animated Pink Arrow */}
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      whileHover={{ rotate: 15 }}
                    >
                      <ArrowRight className="h-5 w-5" style={{ color: "#E1306C" }} />
                    </motion.div>
                  </span>
                </motion.a>
              </div>

              {/* Powered By Section */}
              <div className="mt-12 flex items-center gap-4 opacity-75">
                <span style={{ color: "rgba(103,232,249,0.7)" }}>
                  Powered by:
                </span>
                <div className="flex gap-4">
                  <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-1">
                    <a
                      href="https://lablab.ai"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none" }}
                    >
                      <span
                        style={{
                          background: "linear-gradient(45deg, #FF6B6B, #4ECDC4)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          fontWeight: "700",
                        }}
                      >
                        Lablab.ai
                      </span>
                    </a>
                  </motion.div>
                  <span style={{ color: "rgba(103,232,249,0.3)" }}>|</span>
                  <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-1">
                    <a
                      href="https://www.ibm.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none" }}
                    >
                      <span
                        style={{
                          background: "linear-gradient(45deg, #00C4FF, #0051FF)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          fontWeight: "700",
                        }}
                      >
                        IBM Granite
                      </span>
                    </a>
                  </motion.div>
                  <span style={{ color: "rgba(103,232,249,0.3)" }}>|</span>
                  <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-1">
                    <a
                      href="https://agent.ai"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none" }}
                    >
                      <span
                        style={{
                          background: "linear-gradient(45deg, #FF9A9E, #FAD0C4)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          fontWeight: "700",
                        }}
                      >
                        Agent.ai
                      </span>
                    </a>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Right Preview */}
            <motion.div
              style={{
                backgroundColor: "rgba(31, 41, 55, 0.5)",
                borderRadius: "1rem",
                border: `1px solid ${platformDetails[selectedPlatform].color}30`,
                boxShadow: `0 0 20px ${platformDetails[selectedPlatform].color}20`,
                padding: "1.5rem",
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {/* Platform Selector */}
              <div className="flex gap-4 mb-6 justify-center">
                {(["twitter", "instagram", "linkedin"] as const).map(
                  (platform) => (
                    <motion.div
                      key={platform}
                      title={`Select ${platform} platform`}
                      animate={{
                        boxShadow: [
                          `0 0 4px ${platformDetails[platform].color}`,
                          `0 0 8px ${platformDetails[platform].color}`,
                          `0 0 4px ${platformDetails[platform].color}`,
                        ],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: "easeInOut",
                      }}
                      whileHover={{
                        scale: 1.1,
                        boxShadow: `0 0 12px ${platformDetails[platform].color}`,
                      }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedPlatform(platform)}
                      style={{
                        padding: "0.5rem",
                        borderRadius: "50%",
                        cursor: "pointer",
                        backgroundColor:
                          selectedPlatform === platform
                            ? `${platformDetails[platform].color}20`
                            : "transparent",
                        border: `1px solid ${platformDetails[platform].color}30`,
                      }}
                    >
                      {React.createElement(platformDetails[platform].icon, {
                        size: 24,
                        color:
                          selectedPlatform === platform
                            ? platformDetails[platform].color
                            : `${platformDetails[platform].color}80`,
                      })}
                    </motion.div>
                  )
                )}
              </div>

              {/* Style Analysis Preview */}
              <div style={{ marginBottom: "2rem" }}>
                <h3
                  style={{
                    color: platformDetails[selectedPlatform].color,
                    marginBottom: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Brain className="h-5 w-5" />
                  {selectedPlatform.charAt(0).toUpperCase() +
                    selectedPlatform.slice(1)} Patterns
                </h3>
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  {platformDetails[selectedPlatform].analysis.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.5rem",
                        borderBottom: `1px solid ${platformDetails[selectedPlatform].color}20`,
                      }}
                    >
                      <span style={{ color: "rgba(103,232,249,0.7)" }}>
                        {item.label}
                      </span>
                      <span style={{ color: platformDetails[selectedPlatform].color }}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generated Content Preview */}
              <div
                style={{
                  backgroundColor: "rgba(17, 24, 39, 0.5)",
                  padding: "1rem",
                  borderRadius: "0.75rem",
                  border: `1px solid ${platformDetails[selectedPlatform].color}30`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div
                    style={{
                      width: "2.5rem",
                      height: "2.5rem",
                      borderRadius: "50%",
                      backgroundColor: platformDetails[selectedPlatform].color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {(() => {
                      const SelectedIcon =
                        platformDetails[selectedPlatform].icon;
                      return <SelectedIcon size={20} color="white" />;
                    })()}
                  </div>
                  <div>
                    <div
                      style={{
                        color: platformDetails[selectedPlatform].color,
                        fontWeight: "700",
                      }}
                    >
                      @{selectedPlatform}_user
                    </div>
                    <div
                      style={{
                        color: "rgba(103,232,249,0.7)",
                        fontSize: "0.875rem",
                      }}
                    >
                      {selectedPlatform.charAt(0).toUpperCase() +
                        selectedPlatform.slice(1)} Content Specialist
                    </div>
                  </div>
                </div>
                <p
                  style={{
                    color: platformDetails[selectedPlatform].color,
                    lineHeight: "1.5",
                    marginBottom: "1rem",
                    borderLeft: `2px solid ${platformDetails[selectedPlatform].color}30`,
                    paddingLeft: "1rem",
                  }}
                >
                  {selectedPlatform === "twitter" && (
                    <>
                      "Exploring AI ethics frameworks... 🧵 Key findings:
                      <br />
                      1. Transparency varies wildly
                      <br />
                      2. Consent mechanisms..."
                    </>
                  )}
                  {selectedPlatform === "instagram" && (
                    <>
                      "Just launched our new platform! 🌟
                      <br />
                      ✨ AI-powered content creation
                      <br />
                      🎨 Cross-platform scheduling
                      <br />
                      #DigitalMarketing #AICreativity"
                    </>
                  )}
                  {selectedPlatform === "linkedin" && (
                    <>
                      "Thrilled to announce our Series B funding round! 🚀
                      <br />
                      Grateful to our investors and team for making this possible.
                      <br />
                      This capital will accelerate our AI research and expand our platform capabilities."
                    </>
                  )}
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: `${platformDetails[selectedPlatform].color}80`,
                    fontSize: "0.875rem",
                  }}
                >
                  <span style={{ color: platformDetails[selectedPlatform].color }}>
                    92% Style Match
                  </span>
                  <span>↑ 3.1x Engagement</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
