"use client"

import { motion } from "framer-motion"
import {
  Twitter,
  ArrowLeft,
  RefreshCw,
  MessageCircle,
  Heart,
  Linkedin,
  Instagram,
  Repeat2,
  Share2,
} from "lucide-react"
import Link from "next/link"

export default function NewHomePage() {
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
          0% { opacity: 0.3; }
          50% { opacity: 0.6; }
          100% { opacity: 0.3; }
        }
        @keyframes pulse {
          0% { border-color: rgba(34, 211, 238, 0.3); }
          50% { border-color: rgba(34, 211, 238, 0.6); }
          100% { border-color: rgba(34, 211, 238, 0.3); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
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
        .card-grid {
          display: grid;
          grid-template-columns: repeat(2, auto);
          gap: 2rem;
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
          Choose Your Post Type
        </div>

        {/* Centered 2x2 Grid Container */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "calc(100vh - 80px)",
          }}
        >
          <div className="card-grid">
            {/* ==================== Single Tweet Card ==================== */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0, type: "spring", stiffness: 100 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                width: "480px",
                backgroundColor: "rgba(31, 41, 55, 0.5)",
                padding: "0.75rem",
                borderRadius: "1rem",
                border: "1px solid rgba(34, 211, 238, 0.2)",
                boxShadow: "0 0 20px rgba(34, 211, 238, 0.1)",
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
                <div style={{ color: "#67e8f9", fontWeight: "700" }}>@twitteruser</div>
              </div>
              {/* Tweet Content */}
              <div style={{ color: "#67e8f9", fontSize: "0.95rem", lineHeight: "1.5", marginTop: "0.25rem" }}>
                Check out our new single tweet generator with cyberpunk aesthetics! 🚀
              </div>
              {/* Tweet Image with overlay instructions */}
              <div
                style={{
                  position: "relative",
                  height: "300px",
                  borderRadius: "0.5rem",
                  overflow: "hidden",
                  marginTop: "0.25rem",
                  background: "linear-gradient(145deg, rgba(6,182,212,0.1), rgba(103,232,249,0.05))",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(145deg, rgba(6,182,212,0.1), rgba(103,232,249,0.05))",
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
                  <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.4rem" }}>How to Use?</h3>
                  <ol
                    style={{
                      margin: 0,
                      paddingLeft: "1rem",
                      listStyle: "decimal",
                      textAlign: "left",
                      width: "100%",
                    }}
                  >
                    <li>Click "Generate Content".</li>
                    <li>Enter the username you want to use (e.g., Elon Musk).</li>
                    <li>Specify what the tweet should be about.</li>
                    <li>(Optional) Provide any articles or page links.</li>
                    <li>Click "Generate Content" again.</li>
                    <li>Preview and save the content.</li>
                  </ol>
                </div>
              </div>
              {/* Tweet Stats */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  color: "rgba(103,232,249,0.7)",
                  marginTop: "0.25rem",
                }}
              >
                <motion.div whileHover={{ scale: 1.1 }} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <MessageCircle size={18} />
                  <span>284</span>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <RefreshCw size={18} />
                  <span>156</span>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Heart size={18} fill="#ef4444" color="#ef4444" />
                  <span>892</span>
                </motion.div>
              </div>
              {/* Generate Button */}
              <div style={{ marginTop: "0.5rem" }}>
                <Link href="/generate-single-tweet" style={{ textDecoration: "none" }}>
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
                    <span style={{ fontSize: "1rem" }}>Generate Single Tweet</span>
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            {/* ==================== Tweet Thread Card ==================== */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              whileHover={{ scale: 1.03 }}
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
              {/* Tweet Thread Preview */}
              <div
                style={{
                  backgroundColor: "rgba(17, 24, 39, 0.5)",
                  borderRadius: "0.5rem",
                  border: "1px solid rgba(34,211,238,0.2)",
                  overflow: "hidden",
                }}
              >
                {[1, 2, 3, 4, 5].map((item, idx) => (
                  <div
                    key={item}
                    style={{
                      padding: "0.5rem 1rem",
                      borderBottom: idx < 4 ? "1px solid rgba(34,211,238,0.2)" : "none",
                      position: "relative",
                    }}
                  >
                    {item > 1 && (
                      <div
                        style={{
                          position: "absolute",
                          left: "34px",
                          top: "0",
                          bottom: "0",
                          width: "2px",
                          background:
                            "linear-gradient(to bottom, transparent, rgba(34,211,238,0.2), transparent)",
                        }}
                      />
                    )}
                    <div style={{ display: "flex", gap: "0.5rem" }}>
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
                      <div style={{ flex: 1 }}>
                        <div style={{ color: "#67e8f9", fontSize: "0.875rem" }}>@twitteruser</div>
                        <div
                          style={{
                            color: "#67e8f9",
                            opacity: 1 - (item - 1) * 0.15,
                            lineHeight: "1.3",
                          }}
                        >
                          {item === 1 && (
                            <>
                              🚀 Announcing our new Twitter thread generator with cyberpunk aesthetics!
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "repeat(2, 1fr)",
                                  gap: "0.25rem",
                                  marginTop: "0.25rem",
                                }}
                              >
                                {[1, 2].map((img) => (
                                  <div
                                    key={img}
                                    style={{
                                      position: "relative",
                                      height: "60px",
                                      border: "1px solid rgba(34,211,238,0.2)",
                                      borderRadius: "4px",
                                      overflow: "hidden",
                                      background: "linear-gradient(145deg, rgba(6,182,212,0.1), rgba(103,232,249,0.05))",
                                    }}
                                  >
                                    {/* Placeholder for image */}
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                          {item === 2 &&
                            "✨ Features include: AI suggestions, real-time collaboration, and cyberpunk templates."}
                          {item === 3 &&
                            "💻 Coming soon – stay tuned for early access!"}
                          {item === 4 &&
                            "🔥 More innovative ideas to come!"}
                          {item === 5 &&
                            "🚨 Exclusive early access for our subscribers."}
                        </div>
                        {item === 1 && (
                          <div
                            style={{
                              display: "flex",
                              gap: "1rem",
                              color: "rgba(103,232,249,0.5)",
                              fontSize: "0.75rem",
                              marginTop: "0.25rem",
                            }}
                          >
                            <span>9:44 AM</span>
                            <span>2.1K Views</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Generate Button */}
              <div style={{ marginTop: "0.5rem" }}>
                <Link href="/generate-thread" style={{ textDecoration: "none" }}>
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
                    <span style={{ fontSize: "1rem" }}>Generate Tweet Thread</span>
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            {/* ==================== Instagram Post Card (Updated with Pink/Red Aesthetics) ==================== */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                width: "480px",
                backgroundColor: "rgba(31, 41, 55, 0.5)",
                padding: "1rem",
                borderRadius: "1rem",
                border: "1px solid rgba(240,46,170,0.2)",
                boxShadow: "0 0 20px rgba(240,46,170,0.1)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Instagram Header */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Instagram size={24} color="white" />
                </div>
                <div style={{ color: "#f02ea6", fontWeight: "700" }}>@instauser</div>
              </div>
              {/* Caption comes FIRST */}
              <div style={{ color: "#f02ea6", fontSize: "0.95rem", lineHeight: "1.5", marginTop: "0.25rem" }}>
                This is a sample Instagram caption with some hashtags{" "}
                <strong>#cyberpunk</strong> <strong>#AI</strong>
              </div>
              {/* Square Image Preview with overlay instructions */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  paddingBottom: "100%",
                  borderRadius: "0.5rem",
                  overflow: "hidden",
                  marginTop: "0.25rem",
                  background: "linear-gradient(145deg, rgba(240,46,170,0.1), rgba(240,46,170,0.05))",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(145deg, rgba(240,46,170,0.1), rgba(240,46,170,0.05))",
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
                    color: "#f02ea6",
                    textAlign: "center",
                    fontSize: "1.2rem",
                    lineHeight: "1.4",
                  }}
                >
                  <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.4rem" }}>How to Use?</h3>
                  <ol
                    style={{
                      margin: 0,
                      paddingLeft: "1rem",
                      listStyle: "decimal",
                      textAlign: "left",
                      width: "100%",
                    }}
                  >
                    <li>Click "Generate Content".</li>
                    <li>Enter the username you want to use (e.g., Elon Musk).</li>
                    <li>Specify what the content should be about.</li>
                    <li>(Optional) Provide any articles or page links.</li>
                    <li>Click "Generate Content" again.</li>
                    <li>Preview and save the content.</li>
                  </ol>
                </div>
              </div>
              {/* Engagement Stats */}
              <div
                style={{
                  borderTop: "1px solid rgba(240,46,170,0.2)",
                  padding: "0.5rem 0",
                  color: "rgba(240,46,170,0.7)",
                  fontSize: "0.875rem",
                  textAlign: "center",
                  marginTop: "0.25rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-around" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <Heart size={18} fill="#ef4444" color="#ef4444" />
                    <span>1.2K</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <MessageCircle size={18} />
                    <span>89</span>
                  </div>
                </div>
              </div>
              {/* Generate Button */}
              <div style={{ marginTop: "0.5rem" }}>
                <Link href="/generate-instagram" style={{ textDecoration: "none" }}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      padding: "0.75rem 1rem",
                      backgroundColor: "rgba(240,46,170,0.1)",
                      color: "#f02ea6",
                      borderRadius: "0.75rem",
                      border: "1px solid rgba(240,46,170,0.3)",
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
                    <span style={{ fontSize: "1rem" }}>Generate Instagram Post</span>
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            {/* ==================== Improved LinkedIn Post Card ==================== */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                width: "480px",
                backgroundColor: "rgba(31,41,55,0.5)",
                padding: "0.5rem",
                borderRadius: "1rem",
                border: "1px solid rgba(236,72,153,0.2)",
                boxShadow: "0 0 20px rgba(236,72,153,0.1)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* LinkedIn Header */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
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
                <div style={{ color: "#67e8f9", fontWeight: "700", fontSize: "1rem" }}>
                  LinkedIn User
                  <div style={{ fontSize: "0.8rem", color: "rgba(103,232,249,0.7)" }}>
                    Professional Title
                  </div>
                </div>
              </div>
              {/* Post Content (Caption) comes FIRST */}
              <div style={{ color: "#67e8f9", fontSize: "0.95rem", lineHeight: "1.4", marginTop: "0.25rem" }}>
                This is a sample LinkedIn post with a professional tone. It includes insights on the future of work and technology.
              </div>
              {/* Square Image Preview with overlay instructions */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  paddingBottom: "100%",
                  borderRadius: "0.5rem",
                  overflow: "hidden",
                  marginTop: "0.25rem",
                  background: "linear-gradient(145deg, rgba(6,182,212,0.1), rgba(103,232,249,0.05))",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(145deg, rgba(6,182,212,0.1), rgba(103,232,249,0.05))",
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
                  <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.4rem" }}>How to Use?</h3>
                  <ol
                    style={{
                      margin: 0,
                      paddingLeft: "1rem",
                      listStyle: "decimal",
                      textAlign: "left",
                      width: "100%",
                    }}
                  >
                    <li>Click "Generate Content".</li>
                    <li>Enter the username you want to use (e.g., Elon Musk).</li>
                    <li>Specify what the post should be about.</li>
                    <li>(Optional) Provide any articles or page links.</li>
                    <li>Click "Generate Content" again.</li>
                    <li>Preview and save the content.</li>
                  </ol>
                </div>
              </div>
              {/* Engagement Stats: Likes, Reposts, Shares */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  padding: "0.5rem 0",
                  color: "rgba(103,232,249,0.7)",
                  fontSize: "0.875rem",
                  textAlign: "center",
                  marginTop: "0.25rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <Heart size={18} fill="#ef4444" color="#ef4444" />
                  <span>1.2K</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <Repeat2 size={18} color="rgba(103,232,249,0.7)" />
                  <span>345</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <Share2 size={18} color="rgba(103,232,249,0.7)" />
                  <span>78</span>
                </div>
              </div>
              {/* Generate Button */}
              <div style={{ marginTop: "0.25rem" }}>
                <Link href="/generate-linkedin" style={{ textDecoration: "none" }}>
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
                    <span style={{ fontSize: "1rem" }}>Generate LinkedIn Post</span>
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

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
  )
}
