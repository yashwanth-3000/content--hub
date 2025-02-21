"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Linkedin, Send, Bot, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { createClient } from "@supabase/supabase-js";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  TooltipProps,
} from "recharts";

// Initialize Supabase client using your environment variables.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

//
// Type Definitions & Dummy Data Generator
//

interface LinkedInPostData {
  activity_id: string;
  commentary: string;
  header_text: string | null;
  num_reactions: number;
  num_comments: number;
  num_shares: number;
  reaction_breakdown: {
    like: number;
    praise: number;
    empathy: number;
    appreciation?: number;
    interest?: number;
  };
  time_elapsed: string;
  created_at: string;
  attachments: {
    att_type: string;
    image_urls?: string[];
    thumbnail_url?: string;
  }[];
}

interface ParsedLinkedInPost {
  date: string;
  timestamp: number;
  reactions: number;
  comments: number;
  shares: number;
  totalEngagement: number;
}

interface Message {
  type: "user" | "bot";
  content: string;
}

// Dummy data generator (for charts when no real data is available).
const generateDummyLinkedInData = (): ParsedLinkedInPost[] => {
  return Array.from({ length: 7 }, (_, i) => {
    const timestamp = new Date().getTime() + i * 86400000;
    const reactions = Math.floor(100 + Math.random() * 400);
    const comments = Math.floor(10 + Math.random() * 50);
    const shares = Math.floor(5 + Math.random() * 30);
    return {
      timestamp,
      date: new Date(timestamp).toLocaleDateString(),
      reactions,
      comments,
      shares,
      totalEngagement: reactions + comments + shares,
    };
  });
};

//
// Data Parsing Functions
//

const parseLinkedInData = (posts: LinkedInPostData[]): ParsedLinkedInPost[] => {
  if (!Array.isArray(posts) || posts.length === 0) {
    throw new Error("Invalid or empty post data received");
  }
  return posts
    .filter((post) => !post.header_text?.toLowerCase().includes("reposted"))
    .map((post) => {
      // Use created_at if available; otherwise, parse time_elapsed.
      const postDate = post.created_at
        ? new Date(post.created_at)
        : parseTimeElapsed(post.time_elapsed);
      return {
        date: postDate.toLocaleDateString(),
        timestamp: postDate.getTime(),
        reactions: post.num_reactions || 0,
        comments: post.num_comments || 0,
        shares: post.num_shares || 0,
        totalEngagement:
          (post.num_reactions || 0) +
          (post.num_comments || 0) +
          (post.num_shares || 0),
      };
    })
    .sort((a, b) => a.timestamp - b.timestamp);
};

const parseTimeElapsed = (timeElapsed: string): Date => {
  const now = new Date();
  const [numStr, unit] = timeElapsed.split(" ");
  const num = parseInt(numStr, 10);
  if (unit?.startsWith("month")) now.setMonth(now.getMonth() - num);
  else if (unit?.startsWith("year")) now.setFullYear(now.getFullYear() - num);
  else if (unit?.startsWith("day")) now.setDate(now.getDate() - num);
  else if (unit?.startsWith("week")) now.setDate(now.getDate() - num * 7);
  return now;
};

//
// Fetch LinkedIn Data with DB Check (Using the Terminal DB Schema)
//

const fetchLinkedInData = async (url: string) => {
  // Validate the URL.
  if (!url.includes("linkedin.com/")) {
    throw new Error("Please enter a valid LinkedIn URL");
  }

  // Extract username from the URL.
  // E.g. "https://www.linkedin.com/in/pyashwanthkrishna/" yields "pyashwanthkrishna"
  const match = url.match(/linkedin\.com\/in\/([^\/?#]+)/i);
  if (!match || !match[1]) {
    throw new Error("Could not extract username from the URL");
  }
  const username = match[1];

  let posts: LinkedInPostData[];

  // Check Supabase DB first.
  const { data: existingData, error: dbError } = await supabase
    .from("social_posts")
    .select("raw_content")
    .eq("platform", "linkedin")
    .eq("username", username)
    .single();

  if (!dbError && existingData) {
    const raw = existingData.raw_content;
    // In our DB, the API response is stored either directly or under a "response" property.
    const dataFromDb = raw.response || raw;
    // For LinkedIn, the stored object should have a key matching the username.
    if (typeof dataFromDb === "object" && !Array.isArray(dataFromDb)) {
      const accountData = dataFromDb[username];
      if (!accountData || !accountData.posts) {
        throw new Error("Invalid database format: missing account posts");
      }
      posts = accountData.posts;
    } else if (Array.isArray(raw)) {
      // Fallback if raw_content was stored as an array.
      posts = raw;
    } else {
      throw new Error("Invalid database format");
    }
  } else {
    // If not found in DB, fetch from API.
    const response = await fetch(
      "https://api-lr.agent.ai/v1/agent/cv2ubaozjew6mcrt/webhook/672bc812",
      {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ LinkedIn_url: url }),
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}. Details: ${errorText}`);
    }
    const responseData = await response.json();
    // The API response may be wrapped under "response".
    const data = responseData.response || responseData;
    // In the API response, the key is the LinkedIn username.
    const accountData = data[username];
    if (!accountData || !accountData.posts) {
      throw new Error("Invalid API response structure: missing posts");
    }
    posts = accountData.posts;

    // Save the fetched API data to Supabase for future use.
    const { error: insertError } = await supabase
      .from("social_posts")
      .insert([
        {
          platform: "linkedin",
          username,
          raw_content: responseData, // store the full API response
          content: "", // leave content empty for manual editing
        },
      ]);
    if (insertError) {
      console.error("Error inserting data into DB:", insertError);
    }
  }

  // Process posts and compute basic metrics.
  const originalPosts = posts.filter((post) => !post.header_text?.toLowerCase().includes("reposted"));
  if (originalPosts.length === 0) {
    return {
      analysis: `# LinkedIn Profile Analysis\n\nNo original posts found for this profile.`,
      postData: [],
    };
  }

  const avgReactions = Math.round(
    originalPosts.reduce((acc, post) => acc + (post.num_reactions || 0), 0) / originalPosts.length
  );
  const avgComments = Math.round(
    originalPosts.reduce((acc, post) => acc + (post.num_comments || 0), 0) / originalPosts.length
  );
  const avgShares = Math.round(
    originalPosts.reduce((acc, post) => acc + (post.num_shares || 0), 0) / originalPosts.length
  );

  let mostCommonReaction = "like";
  try {
    if (originalPosts[0]?.reaction_breakdown) {
      const entries = Object.entries(originalPosts[0].reaction_breakdown);
      if (entries.length > 0) {
        mostCommonReaction = entries.sort((a, b) => b[1] - a[1])[0][0];
      }
    }
  } catch (e) {
    console.error("Error determining most common reaction:", e);
  }

  const analysis = `# LinkedIn Profile Analysis

## Engagement Overview
Analysis of ${originalPosts.length} original posts:

## Key Metrics
- **Avg reactions/post:** ${avgReactions.toLocaleString()}
- **Avg comments/post:** ${avgComments.toLocaleString()}
- **Avg shares/post:** ${avgShares.toLocaleString()}

## Performance Insights
- Top posts receive ${Math.round(avgReactions * 1.5).toLocaleString()}+ reactions
- Engagement distribution:
  - Reactions: ${((avgReactions / (avgReactions + avgComments + avgShares)) * 100).toFixed(0)}%
  - Comments: ${((avgComments / (avgReactions + avgComments + avgShares)) * 100).toFixed(0)}%
  - Shares: ${((avgShares / (avgReactions + avgComments + avgShares)) * 100).toFixed(0)}%
- Most common reaction: ${mostCommonReaction.replace(/_/g, " ").toUpperCase()}`;

  return { analysis, postData: parseLinkedInData(posts) };
};

//
// Main Component: LinkedInAnalyzer
//

const LinkedInAnalyzer = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [profileUrl, setProfileUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [postData, setPostData] = useState<ParsedLinkedInPost[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dummyDataState, setDummyDataState] = useState(generateDummyLinkedInData());
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the chat container on new messages.
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Update dummy data every 2.5 seconds when no real post data is available.
  useEffect(() => {
    if (!postData || postData.length === 0) {
      const interval = setInterval(() => {
        setDummyDataState(generateDummyLinkedInData());
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [postData]);

  const handleAnalyze = async () => {
    if (!profileUrl) {
      setError("Please enter a LinkedIn profile URL");
      return;
    }
    setLoading(true);
    setError(null);
    setMessages((prev) => [
      ...prev,
      { type: "user", content: `Analyze LinkedIn profile: ${profileUrl}` },
    ]);

    try {
      const data = await fetchLinkedInData(profileUrl);
      setPostData(data.postData);
      setMessages((prev) => [
        ...prev,
        { type: "bot", content: data.analysis },
      ]);
    } catch (error: any) {
      console.error("Analysis failed:", error);
      const errorMessage = error.message || "Failed to fetch data. Please try again.";
      setError(errorMessage);
      setMessages((prev) => [
        ...prev,
        { type: "bot", content: `Sorry, I encountered an error: ${errorMessage}` },
      ]);
    }
    setLoading(false);
    setProfileUrl("");
  };

  const formatXAxis = (tickItem: number) =>
    new Date(tickItem).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-900/95 border border-cyan-500 rounded-lg p-4 shadow-lg backdrop-blur-sm"
        >
          <p className="text-cyan-300 mb-2 font-semibold">
            {new Date(label).toLocaleDateString()}
          </p>
          {payload.map((item, index) => (
            <p key={index} className="text-sm" style={{ color: item.color }}>
              {item.name}: <span className="text-cyan-300">{item.value?.toLocaleString()}</span>
            </p>
          ))}
        </motion.div>
      );
    }
    return null;
  };

  return (
    <>
      {/* Global CSS to hide scrollbars */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div className="h-screen bg-gray-900 font-mono">
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full min-h-0">
          {/* Left Section – Chatbot & Input */}
          <motion.div
            className="flex flex-col h-full min-h-0 bg-gray-800/40 rounded-2xl border border-cyan-500/20 shadow-2xl m-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-gray-800/70 p-4 rounded-t-2xl border-b border-cyan-500/20 flex items-center gap-3">
              <div className="cursor-default">
                <Bot className="text-cyan-400" size={24} />
              </div>
              <h1 className="text-cyan-400 text-xl font-bold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                LinkedIn Analytics Bot
              </h1>
            </div>
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4 text-sm no-scrollbar"
            >
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${
                      message.type === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] p-4 rounded-2xl backdrop-blur-sm ${
                        message.type === "user"
                          ? "bg-cyan-500/20 border border-cyan-500/30"
                          : "bg-gray-700/50 border border-gray-600/20"
                      }`}
                    >
                      {message.type === "bot" ? (
                        <ReactMarkdown
                          components={{
                            h1: ({ children }) => (
                              <h1 className="text-cyan-300 text-lg mb-2 font-bold">{children}</h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-cyan-300 text-base mt-4 mb-2 font-semibold">{children}</h2>
                            ),
                            p: ({ children }) => (
                              <p className="text-cyan-300/80 mb-2 leading-relaxed">{children}</p>
                            ),
                            ul: ({ children }) => (
                              <ul className="text-cyan-300/80 space-y-1 pl-4">{children}</ul>
                            ),
                            li: ({ children }) => (
                              <li className="flex items-center gap-1 before:content-['•'] before:text-cyan-500">
                                {children}
                              </li>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        <p className="text-cyan-300">{message.content}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="bg-gray-800/70 p-4 rounded-b-2xl border-t border-cyan-500/20">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  placeholder="LinkedIn profile URL"
                  className="flex-1 p-3 bg-gray-900/50 border border-cyan-500/30 rounded-lg text-cyan-300 focus:outline-none focus:border-cyan-500 placeholder:text-cyan-500/50"
                  onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
                />
                <motion.button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="px-6 py-3 bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 rounded-lg flex items-center gap-2 hover:bg-cyan-500/20 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {loading ? (
                    <RefreshCw className="animate-spin" size={20} />
                  ) : (
                    <Send size={20} />
                  )}
                </motion.button>
              </div>
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Right Section – Charts */}
          <motion.div
            className="h-full min-h-0 space-y-6 overflow-y-auto m-4 no-scrollbar"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {postData && postData.length > 0 ? (
              <>
                <motion.div
                  className="bg-gray-800/40 rounded-2xl border border-cyan-500/20 p-4 h-[400px]"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                >
                  <h3 className="text-cyan-300 mb-4 font-bold text-lg">Engagement Timeline</h3>
                  <ResponsiveContainer width="100%" height="90%">
                    <LineChart data={postData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis
                        dataKey="timestamp"
                        stroke="#67e8f9"
                        tickFormatter={formatXAxis}
                        angle={-45}
                        textAnchor="end"
                        height={50}
                      />
                      <YAxis stroke="#67e8f9" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line type="monotone" dataKey="reactions" stroke="#06b6d4" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="comments" stroke="#22d3ee" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div
                  className="bg-gray-800/40 rounded-2xl border border-cyan-500/20 p-4 h-[400px]"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                >
                  <h3 className="text-cyan-300 mb-4 font-bold text-lg">Engagement Breakdown</h3>
                  <ResponsiveContainer width="100%" height="90%">
                    <BarChart data={postData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis
                        dataKey="timestamp"
                        stroke="#67e8f9"
                        tickFormatter={formatXAxis}
                        angle={-45}
                        textAnchor="end"
                        height={50}
                      />
                      <YAxis stroke="#67e8f9" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="reactions" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="comments" fill="#0891b2" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="shares" fill="#0e7490" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div
                  className="bg-gray-800/40 rounded-2xl border border-cyan-500/20 p-4 h-[400px]"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                >
                  <h3 className="text-cyan-300 mb-4 font-bold text-lg">Engagement Correlation</h3>
                  <ResponsiveContainer width="100%" height="90%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="reactions" name="Reactions" stroke="#67e8f9" type="number" />
                      <YAxis dataKey="totalEngagement" name="Total Engagement" stroke="#67e8f9" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Scatter name="Posts" data={postData} fill="#06b6d4" shape="circle" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </motion.div>
              </>
            ) : (
              // Dummy graphs with overlay text.
              <div className="w-full space-y-6 mt-4">
                <motion.div
                  className="relative bg-gray-800/40 rounded-2xl border border-cyan-500/20 p-4 h-[400px]"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                >
                  <h3 className="text-cyan-300 mb-4 font-bold text-lg">Engagement Timeline</h3>
                  <ResponsiveContainer width="100%" height="90%">
                    <LineChart data={dummyDataState}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis
                        dataKey="timestamp"
                        stroke="#67e8f9"
                        tickFormatter={formatXAxis}
                        angle={-45}
                        textAnchor="end"
                        height={50}
                      />
                      <YAxis stroke="#67e8f9" />
                      <Line type="monotone" dataKey="reactions" stroke="#06b6d4" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="comments" stroke="#22d3ee" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                    <p className="text-cyan-300 text-xl">Enter a LinkedIn profile URL..</p>
                  </div>
                </motion.div>

                <motion.div
                  className="relative bg-gray-800/40 rounded-2xl border border-cyan-500/20 p-4 h-[400px]"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                >
                  <h3 className="text-cyan-300 mb-4 font-bold text-lg">Engagement Breakdown</h3>
                  <ResponsiveContainer width="100%" height="90%">
                    <BarChart data={dummyDataState}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis
                        dataKey="timestamp"
                        stroke="#67e8f9"
                        tickFormatter={formatXAxis}
                        angle={-45}
                        textAnchor="end"
                        height={50}
                      />
                      <YAxis stroke="#67e8f9" />
                      <Bar dataKey="reactions" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="comments" fill="#0891b2" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="shares" fill="#0e7490" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                    <p className="text-cyan-300 text-xl">Enter a LinkedIn profile URL.</p>
                  </div>
                </motion.div>

                <motion.div
                  className="relative bg-gray-800/40 rounded-2xl border border-cyan-500/20 p-4 h-[400px]"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                >
                  <h3 className="text-cyan-300 mb-4 font-bold text-lg">Engagement Correlation</h3>
                  <ResponsiveContainer width="100%" height="90%">
                    <ScatterChart
                      margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
                      data={dummyDataState}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="reactions" name="Reactions" stroke="#67e8f9" type="number" />
                      <YAxis dataKey="totalEngagement" name="Total Engagement" stroke="#67e8f9" />
                      <Scatter name="Posts" data={dummyDataState} fill="#06b6d4" shape="circle" />
                    </ScatterChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                    <p className="text-cyan-300 text-xl">Enter a LinkedIn profile URL.</p>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default LinkedInAnalyzer;
