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

  const background = useMotionTemplate`
    radial-gradient(
      800px at ${mouseX}px ${mouseY}px, 
      rgba(103,232,249,0.1), 
      rgba(103,232,249,0.05) 50%, 
      transparent 80%
    )
  `;

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
      `}</style>

      <div className="crt-effect" style={{ minHeight: "100%" }}>
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{ background }}
        />

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
            Content Hub
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              color: "#67e8f9",
              lineHeight: "1.6",
              fontSize: "1rem",
            }}
          >
            {/* Introduction Section */}
            <div style={{ marginBottom: "2rem" }}>
              <p>
                Content Hub is an innovative platform dedicated to transforming social media engagement through the generation of personalized, SEO-optimized content. Our solution is built on advanced artificial intelligence, leveraging IBM’s Granite AI models and their robust APIs for inference. This integration allows us to deliver dynamic digital content that not only captures the unique voice of each user but also meets the stringent demands of today’s competitive digital landscape. By processing data from major social media platforms such as Twitter, LinkedIn, and Instagram, Content Hub converts raw user interactions into compelling narratives within seconds.
              </p>
            </div>

            {/* Challenges Section */}
            <div style={{ marginBottom: "2rem" }}>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  marginBottom: "1rem",
                }}
              >
                What We Wanted to Create But Couldn't
              </h2>

              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "600" }}>
                  LLM Fine-Tuning with Our Dataset:
                </h3>
                <p>
                  We initially planned to fine-tune a granintr language model using our meticulously prepared dataset—comprising diverse user interactions and integrated SEO strategies—to achieve even greater content nuance. However, persistent API errors forced us to pivot and rely on the existing Granite model.
                </p>
                <div style={{ marginTop: "1rem" }}>
                  <video
                    controls
                    style={{
                      width: "100%",
                      maxWidth: "600px",
                      borderRadius: "8px",
                      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    <source src="https://i.imgur.com/opUDQGL.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "600" }}>
                  Social Content Calendar:
                </h3>
                <p>
                  A key feature in our vision was a Social Content Calendar designed to assist users in planning and managing their posting schedules effectively. Unfortunately, the LLM exhibited a tendency to hallucinate, resulting in frequent JSON file errors, which rendered the integration of this feature into the website unfeasible.
                </p>
                <p>
                  See our Social Content Calendar prototype{" "}
                  <a
                    href="/social-media-timeline"
                    style={{ color: "#FF4136", textDecoration: "underline" }}
                  >
                    /social-media-timeline
                  </a>
                  .
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "600" }}>
                  Instagram Content Creation Module:
                </h3>
                <p>
                  We also envisioned a dedicated module for Instagram content creation, tailored to the platform’s unique dynamics. Due to time constraints, this feature remains a future aspiration.
                </p>
              </div>
            </div>

            {/* Future Insights Section */}
            <div style={{ marginBottom: "2rem" }}>
              <p>
                Each of these challenges has provided valuable insights that will guide future iterations of Content Hub. We remain dedicated to expanding the platform’s capabilities and continuing our pursuit of excellence in AI-driven digital engagement.
              </p>
              <p>
                At its core, Content Hub empowers users with actionable insights and analytics, enabling them to optimize their online presence and refine their digital communication strategies. Our platform exemplifies the potential of strategic AI integration, setting a new benchmark for efficiency and precision in digital marketing. With IBM’s Granite AI technology as our foundation, we ensure reliability and performance while pushing the boundaries of automated content creation. We have meticulously designed system prompts for each mode—Twitter tweet generation, threads generation, LinkedIn post generation, and our analysis models—to maximize output quality.
              </p>
            </div>

            {/* Disclaimer Section */}
            <div>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  marginBottom: "1rem",
                }}
              >
                Disclaimer:
              </h2>
              <p>
                Please note that the quality and accuracy of the content generated by Content Hub are entirely dependent on IBM’s Granite AI model. Although our system prompts and integrated SEO techniques are carefully crafted, their effectiveness is subject to the inherent limitations of the Granite model, which is built on an 8-billion-parameter architecture. In instances where our optimizations may not be perfectly aligned, the final output will rely solely on the capabilities of the Granite model.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;
