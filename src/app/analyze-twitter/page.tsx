"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Twitter, Send, Bot, RefreshCw } from "lucide-react";
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

// Initialize Supabase client using environment variables.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

//
// Type Definitions & Dummy Data Generator
//

interface TweetData {
  created_at: string;
  text: string;
  public_metrics: {
    impression_count: number;
    like_count: number;
    retweet_count: number;
    reply_count: number;
    quote_count: number;
    bookmark_count: number;
  };
}

interface ParsedTweet {
  date: string;
  timestamp: number;
  impressions: number;
  likes: number;
  retweets: number;
  replies: number;
  quotes: number;
  bookmarks: number;
  totalEngagement: number;
}

interface Message {
  type: "user" | "bot";
  content: string;
}

// Function to generate new dummy data for the graphs.
const generateDummyData = () => {
  return Array.from({ length: 7 }, (_, i) => {
    const timestamp = new Date().getTime() + i * 86400000;
    const impressions = Math.floor(200 + Math.random() * 800);
    const likes = Math.floor(20 + Math.random() * 50);
    const retweets = Math.floor(10 + Math.random() * 30);
    const replies = Math.floor(5 + Math.random() * 10);
    return {
      timestamp,
      impressions,
      likes,
      retweets,
      replies,
      totalEngagement: likes + retweets + replies,
    };
  });
};

// Function to parse raw tweet data into a format for graphs.
const parseTwitterData = (apiData: TweetData[]): ParsedTweet[] => {
  return apiData
    .filter((tweet) => !tweet.text.startsWith("RT @"))
    .map((tweet) => ({
      date: new Date(tweet.created_at).toLocaleDateString(),
      timestamp: new Date(tweet.created_at).getTime(),
      impressions: tweet.public_metrics.impression_count,
      likes: tweet.public_metrics.like_count,
      retweets: tweet.public_metrics.retweet_count,
      replies: tweet.public_metrics.reply_count,
      quotes: tweet.public_metrics.quote_count,
      bookmarks: tweet.public_metrics.bookmark_count,
      totalEngagement:
        tweet.public_metrics.like_count +
        tweet.public_metrics.retweet_count +
        tweet.public_metrics.reply_count +
        tweet.public_metrics.quote_count +
        tweet.public_metrics.bookmark_count,
    }))
    .sort((a, b) => a.timestamp - b.timestamp);
};

//
// Combined fetchTwitterData function (checks Supabase first, then API)
//

const fetchTwitterData = async (username: string) => {
  try {
    // Try to get data from Supabase
    const { data: existingData, error: dbError } = await supabase
      .from("social_posts")
      .select("raw_content")
      .eq("platform", "twitter")
      .eq("username", username)
      .single();

    let tweets: TweetData[];

    if (!dbError && existingData) {
      tweets = existingData.raw_content;
      if (!Array.isArray(tweets)) throw new Error("Invalid database format");
    } else {
      // If data not in DB, fetch from API
      const response = await fetch(
        "https://api-lr.agent.ai/v1/agent/sa3zhs11qxhjbd8t/webhook/8e25ef47",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ twitter_name: username }),
        }
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      tweets = data.response;

      if (!Array.isArray(tweets)) throw new Error("Invalid response format");

      // Save the fetched tweets to Supabase for future use.
      const { error: insertError } = await supabase
        .from("social_posts")
        .insert([
          {
            platform: "twitter",
            username,
            raw_content: tweets,
            content: "",
          },
        ]);
      if (insertError) console.error("Error inserting data:", insertError);
    }

    // Filter out retweets and compute metrics
    const nonRetweets = tweets.filter((tweet) => !tweet.text.startsWith("RT @"));

    const avgImpressions =
      nonRetweets.length > 0
        ? Math.round(
            nonRetweets.reduce(
              (acc, tweet) => acc + tweet.public_metrics.impression_count,
              0
            ) / nonRetweets.length
          )
        : 0;
    const avgLikes =
      nonRetweets.length > 0
        ? Math.round(
            nonRetweets.reduce(
              (acc, tweet) => acc + tweet.public_metrics.like_count,
              0
            ) / nonRetweets.length
          )
        : 0;
    const avgEngagement =
      nonRetweets.length > 0
        ? Math.round(
            nonRetweets.reduce(
              (acc, tweet) =>
                acc +
                tweet.public_metrics.like_count +
                tweet.public_metrics.retweet_count +
                tweet.public_metrics.reply_count +
                tweet.public_metrics.quote_count +
                tweet.public_metrics.bookmark_count,
              0
            ) / nonRetweets.length
          )
        : 0;

    const analysis = `# Analysis for @${username}

## Profile Overview
Analysis of your last ${nonRetweets.length} original tweets shows:

## Engagement Metrics
- **Avg impressions/tweet:** ${avgImpressions.toLocaleString()}
- **Avg likes/tweet:** ${avgLikes.toLocaleString()}
- **Total engagement/tweet:** ${avgEngagement.toLocaleString()}

## Key Insights
- Your top-performing tweets get ${Math.round(
      avgImpressions * 1.5
    ).toLocaleString()}+ impressions
- Engagement rate: ${
      avgImpressions > 0 ? ((avgEngagement / avgImpressions) * 100).toFixed(2) : "0"
    }%
- Best time to post: 2-5 PM (GMT)`;

    return { analysis, tweetData: parseTwitterData(tweets) };
  } catch (error) {
    console.error("Error fetching Twitter data:", error);
    throw error;
  }
};

//
// Main Component: TwitterAnalyzer
//

const TwitterAnalyzer = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [tweetData, setTweetData] = useState<ParsedTweet[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dummyDataState, setDummyDataState] = useState(generateDummyData());
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Update dummy data every 2.5 seconds when no real data is available.
  useEffect(() => {
    if (!tweetData) {
      const interval = setInterval(() => {
        setDummyDataState(generateDummyData());
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [tweetData]);

  // Auto-scroll the chat container on new messages.
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleAnalyze = async () => {
    if (!username) {
      setError("Please enter a Twitter username");
      return;
    }

    setLoading(true);
    setError(null);

    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        content: `Analyze @${username}'s Twitter profile`,
      },
    ]);

    try {
      const data = await fetchTwitterData(username);
      setTweetData(data.tweetData);

      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          content: data.analysis,
        },
      ]);
    } catch (error) {
      console.error("Analysis failed:", error);
      setError("Failed to fetch data. Please try again.");
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    }

    setLoading(false);
    setUsername("");
  };

  const formatXAxis = (tickItem: number) => {
    return new Date(tickItem).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
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
              {item.name}:{" "}
              <span className="text-cyan-300">
                {item.value?.toLocaleString()}
              </span>
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
        {/* Grid container: two sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full min-h-0">
          {/* Left Section – Chatbot & Introduction */}
          <motion.div
            className="flex flex-col h-full min-h-0 bg-gray-800/40 rounded-2xl border border-cyan-500/20 shadow-2xl m-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Header */}
            <div className="bg-gray-800/70 p-4 rounded-t-2xl border-b border-cyan-500/20 flex items-center gap-3">
              <div className="cursor-default">
                <Bot className="text-cyan-400" size={24} />
              </div>
              <h1 className="text-cyan-400 text-xl font-bold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                Twitter Analytics Bot
              </h1>
            </div>
            {/* Chat Messages & Introduction */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4 text-sm no-scrollbar"
            >
              {messages.length === 0 && (
                <div className="text-center mt-10">
                  <h2 className="text-cyan-300 text-xl font-bold">
                    Analyze Your Profile, Get Insights
                  </h2>
                  <p className="text-cyan-300 mt-2">
                    Here are some questions you might consider:
                  </p>
                  <ul className="text-cyan-300 mt-4 space-y-2">
                    <li>1. How can I improve my tweet engagement?</li>
                    <li>2. Which time of day is best for my tweets?</li>
                    <li>3. How does my profile compare with others?</li>
                    <li>4. What topics resonate most with my audience?</li>
                    <li>
                      5. How can I optimize my tweet content for better reach?
                    </li>
                  </ul>
                </div>
              )}
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${
                      message.type === "user"
                        ? "justify-end"
                        : "justify-start"
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
                              <h1 className="text-cyan-300 text-lg mb-2 font-bold">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-cyan-300 text-base mt-4 mb-2 font-semibold">
                                {children}
                              </h2>
                            ),
                            p: ({ children }) => (
                              <p className="text-cyan-300/80 mb-2 leading-relaxed">
                                {children}
                              </p>
                            ),
                            ul: ({ children }) => (
                              <ul className="text-cyan-300/80 space-y-1 pl-4">
                                {children}
                              </ul>
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
            {/* Input Area */}
            <div className="bg-gray-800/70 p-4 rounded-b-2xl border-t border-cyan-500/20">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="@username"
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

          {/* Right Section – Charts (Scrollable & No Scrollbar) */}
          <motion.div
            className="h-full min-h-0 space-y-6 overflow-y-auto m-4 no-scrollbar"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {tweetData ? (
              <>
                {/* Engagement Timeline */}
                <motion.div
                  className="bg-gray-800/40 rounded-2xl border border-cyan-500/20 p-4 h-[400px]"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                >
                  <h3 className="text-cyan-300 mb-4 font-bold text-lg">
                    Engagement Timeline
                  </h3>
                  <ResponsiveContainer width="100%" height="90%">
                    <LineChart data={tweetData}>
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
                      <Line
                        type="monotone"
                        dataKey="impressions"
                        stroke="#06b6d4"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="likes"
                        stroke="#22d3ee"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* Engagement Breakdown */}
                <motion.div
                  className="bg-gray-800/40 rounded-2xl border border-cyan-500/20 p-4 h-[400px]"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                >
                  <h3 className="text-cyan-300 mb-4 font-bold text-lg">
                    Engagement Breakdown
                  </h3>
                  <ResponsiveContainer width="100%" height="90%">
                    <BarChart data={tweetData}>
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
                      <Bar
                        dataKey="likes"
                        fill="#06b6d4"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="retweets"
                        fill="#0891b2"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="replies"
                        fill="#0e7490"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* Engagement Correlation */}
                <motion.div
                  className="bg-gray-800/40 rounded-2xl border border-cyan-500/20 p-4 h-[400px]"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                >
                  <h3 className="text-cyan-300 mb-4 font-bold text-lg">
                    Engagement Correlation
                  </h3>
                  <ResponsiveContainer width="100%" height="90%">
                    <ScatterChart
                      margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis
                        dataKey="impressions"
                        name="Impressions"
                        stroke="#67e8f9"
                        type="number"
                      />
                      <YAxis
                        dataKey="totalEngagement"
                        name="Engagement"
                        stroke="#67e8f9"
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Scatter
                        name="Tweets"
                        data={tweetData}
                        fill="#06b6d4"
                        shape="circle"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </motion.div>
              </>
            ) : (
              // Dummy graphs with smooth animations and overlay text.
              <div className="w-full space-y-6 mt-4">
                {/* Engagement Timeline Dummy */}
                <motion.div
                  className="relative bg-gray-800/40 rounded-2xl border border-cyan-500/20 p-4 h-[400px]"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                >
                  <h3 className="text-cyan-300 mb-4 font-bold text-lg">
                    Engagement Timeline
                  </h3>
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
                      <Line
                        type="monotone"
                        dataKey="impressions"
                        stroke="#06b6d4"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="likes"
                        stroke="#22d3ee"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                    <p className="text-cyan-300 text-xl">
                      Enter your username to unlock predictions
                    </p>
                  </div>
                </motion.div>

                {/* Engagement Breakdown Dummy */}
                <motion.div
                  className="relative bg-gray-800/40 rounded-2xl border border-cyan-500/20 p-4 h-[400px]"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                >
                  <h3 className="text-cyan-300 mb-4 font-bold text-lg">
                    Engagement Breakdown
                  </h3>
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
                      <Bar
                        dataKey="likes"
                        fill="#06b6d4"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="retweets"
                        fill="#0891b2"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="replies"
                        fill="#0e7490"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                    <p className="text-cyan-300 text-xl">
                      Enter your username to unlock predictions
                    </p>
                  </div>
                </motion.div>

                {/* Engagement Correlation Dummy */}
                <motion.div
                  className="relative bg-gray-800/40 rounded-2xl border border-cyan-500/20 p-4 h-[400px]"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                >
                  <h3 className="text-cyan-300 mb-4 font-bold text-lg">
                    Engagement Correlation
                  </h3>
                  <ResponsiveContainer width="100%" height="90%">
                    <ScatterChart
                      margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
                      data={dummyDataState}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis
                        dataKey="impressions"
                        name="Impressions"
                        stroke="#67e8f9"
                        type="number"
                      />
                      <YAxis
                        dataKey="totalEngagement"
                        name="Engagement"
                        stroke="#67e8f9"
                      />
                      <Scatter
                        name="Tweets"
                        data={dummyDataState}
                        fill="#06b6d4"
                        shape="circle"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                    <p className="text-cyan-300 text-xl">
                      Enter your username to unlock predictions
                    </p>
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

export default TwitterAnalyzer;
