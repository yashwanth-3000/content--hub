"use client";

import { motion } from "framer-motion";
import { Twitter, Linkedin, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function AnalyzeHomePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#111827",
        fontFamily: "monospace",
        position: "relative",
        overflowY: "auto",
        paddingBottom: "2rem",
      }}
    >
      <style jsx global>{`
        @keyframes glow {
          0% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            opacity: 0.3;
          }
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
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
      `}</style>

      <div className="crt-effect" style={{ minHeight: "100%" }}>
        {/* Page Title */}
        <div
          style={{
            padding: "1rem",
            textAlign: "center",
            color: "#67e8f9",
            fontSize: "1.75rem",
            fontWeight: "700",
          }}
        >
          Choose Your Analysis Platform
        </div>

        {/* Horizontal Flex Container for Cards */}
        <motion.div
          initial={{ opacity: 0, x: -200 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "2rem",
            padding: "1rem",
          }}
        >
          {/* Twitter Analysis Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            style={{
              width: "480px",
              backgroundColor: "rgba(31, 41, 55, 0.5)",
              padding: "1rem",
              borderRadius: "1rem",
              border: "1px solid rgba(34,211,238,0.2)",
              boxShadow: "0 0 20px rgba(34,211,238,0.1)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "#06b6d4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Twitter size={24} color="black" />
              </div>
              <div style={{ color: "#67e8f9", fontWeight: "700" }}>
                Twitter Analysis
              </div>
            </div>
            {/* Description */}
            <div
              style={{
                color: "#67e8f9",
                fontSize: "0.95rem",
                lineHeight: "1.5",
                marginTop: "0.25rem",
              }}
            >
              Analyze your Twitter profile for engagement metrics and insights.
            </div>
            {/* Image Preview with Overlay Instructions */}
            <div
              style={{
                position: "relative",
                height: "300px",
                borderRadius: "0.5rem",
                overflow: "hidden",
                marginTop: "0.5rem",
                background:
                  "linear-gradient(145deg, rgba(6,182,212,0.1), rgba(103,232,249,0.05))",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(145deg, rgba(6,182,212,0.1), rgba(103,232,249,0.05))",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  padding: "10%",
                  background: "rgba(0, 0, 0, 0.5)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-evenly",
                  alignItems: "center",
                  color: "#67e8f9",
                  textAlign: "center",
                  fontSize: "1.2rem",
                  lineHeight: "1.4",
                }}
              >
                <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.4rem" }}>
                  How to Use?
                </h3>
                <ol
                  style={{
                    margin: 0,
                    paddingLeft: "1rem",
                    listStyle: "decimal",
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  <li>Click "Analyze Profile".</li>
                  <li>Enter the Twitter username (e.g., @elonmusk).</li>
                  <li>Wait for the analysis to complete.</li>
                  <li>Review your insights.</li>
                </ol>
              </div>
            </div>
            {/* CTA Button */}
            <div style={{ marginTop: "0.75rem" }}>
              <Link href="/analyze-twitter" style={{ textDecoration: "none" }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: "0.75rem 1rem",
                    backgroundColor: "rgba(6,182,212,0.1)",
                    color: "#67e8f9",
                    borderRadius: "0.75rem",
                    border: "1px solid rgba(34,211,238,0.3)",
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                  }}
                >
                  <RefreshCw
                    style={{
                      height: "1.25rem",
                      width: "1.25rem",
                      animation: "spin 2s linear infinite",
                    }}
                  />
                  <span style={{ fontSize: "1rem" }}>
                    Analyze Twitter Profile
                  </span>
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* LinkedIn Analysis Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            style={{
              width: "480px",
              backgroundColor: "rgba(31,41,55,0.5)",
              padding: "1rem",
              borderRadius: "1rem",
              border: "1px solid rgba(10,102,194,0.3)",
              boxShadow: "0 0 20px rgba(10,102,194,0.1)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "#0A66C2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Linkedin size={24} color="white" />
              </div>
              <div style={{ color: "#67e8f9", fontWeight: "700" }}>
                LinkedIn Analysis
              </div>
            </div>
            {/* Description */}
            <div
              style={{
                color: "#67e8f9",
                fontSize: "0.95rem",
                lineHeight: "1.5",
                marginTop: "0.25rem",
              }}
            >
              Analyze your LinkedIn profile for professional engagement and reach.
            </div>
            {/* Image Preview with Overlay Instructions */}
            <div
              style={{
                position: "relative",
                height: "300px",
                borderRadius: "0.5rem",
                overflow: "hidden",
                marginTop: "0.5rem",
                background:
                  "linear-gradient(145deg, rgba(10,102,194,0.1), rgba(10,102,194,0.05))",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(145deg, rgba(10,102,194,0.1), rgba(10,102,194,0.05))",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  padding: "10%",
                  background: "rgba(0, 0, 0, 0.5)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-evenly",
                  alignItems: "center",
                  color: "#67e8f9",
                  textAlign: "center",
                  fontSize: "1.2rem",
                  lineHeight: "1.4",
                }}
              >
                <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.4rem" }}>
                  How to Use?
                </h3>
                <ol
                  style={{
                    margin: 0,
                    paddingLeft: "1rem",
                    listStyle: "decimal",
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  <li>Click "Analyze Profile".</li>
                  <li>
                    Enter the LinkedIn profile URL (e.g.,{" "}
                    <span style={{ fontStyle: "italic" }}>
                      https://www.linkedin.com/in/johnsmith
                    </span>
                    ).
                  </li>
                  <li>Wait for the analysis to complete.</li>
                  <li>Review your insights.</li>
                </ol>
              </div>
            </div>
            {/* CTA Button */}
            <div style={{ marginTop: "0.75rem" }}>
              <Link href="/analyze-linkedin" style={{ textDecoration: "none" }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "rgba(10,102,194,0.1)",
                    color: "#0A66C2",
                    borderRadius: "0.75rem",
                    border: "1px solid rgba(10,102,194,0.3)",
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                  }}
                >
                  <RefreshCw
                    style={{
                      height: "1.25rem",
                      width: "1.25rem",
                      animation: "spin 2s linear infinite",
                    }}
                  />
                  <span style={{ fontSize: "1rem" }}>
                    Analyze LinkedIn Profile
                  </span>
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </motion.div>

        {/* Back Button */}
        <div
          style={{
            position: "absolute",
            top: "1rem",
            left: "1rem",
          }}
        >
          <Link href="/" style={{ textDecoration: "none", color: "#67e8f9" }}>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{
                padding: "0.5rem",
                borderRadius: "0.5rem",
                border: "1px solid rgba(34,211,238,0.3)",
                backgroundColor: "rgba(17,24,39,0.5)",
                cursor: "pointer",
              }}
            >
              <ArrowLeft style={{ width: "1.5rem", height: "1.5rem" }} />
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  );
}
