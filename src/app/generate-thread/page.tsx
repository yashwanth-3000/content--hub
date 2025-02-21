"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@supabase/supabase-js"
import {
  Terminal,
  CheckCircle,
  Twitter,
  Copy,
  Edit3,
  RefreshCw,
  ArrowLeft,
  Save,
} from "lucide-react"
import ReactMarkdown from "react-markdown"
import Link from "next/link"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type TerminalLineType = "command" | "success" | "error" | "info"

const dummyTweets = [
  "// Your generated thread will appear here...",
  "// Your generated thread will appear here...",
  "// Your generated thread will appear here...",
  "// Your generated thread will appear here...",
  "// Your generated thread will appear here...",
  "// Your generated thread will appear here...",
  "// Your generated thread will appear here..."
]

export default function AnalysisPage() {
  const [username, setUsername] = useState("")
  const [url, setUrl] = useState("")
  const [urlQuery, setUrlQuery] = useState("")
  const [terminalLines, setTerminalLines] = useState<
    { text: string; type: TerminalLineType }[]
  >([])
  const [visibleLines, setVisibleLines] = useState<
    { text: string; type: TerminalLineType }[]
  >([])
  const [isLoading, setIsLoading] = useState(false)
  const [usernameVerified, setUsernameVerified] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [tweets, setTweets] = useState<string[]>([])
  const [editableTweets, setEditableTweets] = useState<string[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [generationVersion, setGenerationVersion] = useState(0)
  const terminalEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (terminalLines.length > visibleLines.length) {
      const nextLine = terminalLines[visibleLines.length]
      setVisibleLines((prev) => [...prev, nextLine])
    }
  }, [terminalLines, visibleLines.length])

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [visibleLines])

  const addTerminalLine = (text: string, type: TerminalLineType = "info") => {
    setTerminalLines((prev) => [...prev, { text, type }])
  }

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTerminalLines([])
    setVisibleLines([])
    setTweets([])
    setEditableTweets([])

    try {
      addTerminalLine(`Checking database for ${username}...`, "command")
      // Check if the user already exists in the database
      const { data: existingUser, error: dbError } = await supabase
        .from("social_posts")
        .select("raw_content, content")
        .eq("platform", "twitter")
        .eq("username", username)
        .single()

      if (dbError && dbError.code !== "PGRST116") throw dbError

      if (existingUser) {
        addTerminalLine("Found existing user data", "success")
        addTerminalLine(
          JSON.stringify(existingUser.raw_content, null, 2),
          "info"
        )
        setUsernameVerified(true)
        setShowUrlInput(true)
        return
      }

      addTerminalLine("Analyzing Twitter account...", "command")
      const usernameResponse = await fetch(
        "https://api-lr.agent.ai/v1/agent/sa3zhs11qxhjbd8t/webhook/8e25ef47",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ twitter_name: username }),
        }
      )
      if (!usernameResponse.ok) throw new Error("Username analysis failed")
      const usernameData = await usernameResponse.json()

      // Check the structure of the response and display accordingly
      if (Array.isArray(usernameData.response)) {
        // If the response is an array (as in your DB record), display the tweet texts
        const tweetsText = usernameData.response
          .map((tweet: any) => tweet.text)
          .join("\n\n")
        addTerminalLine(tweetsText, "info")
      } else if (
        usernameData.response &&
        usernameData.response.heading &&
        usernameData.response.response
      ) {
        addTerminalLine(
          `${usernameData.response.heading}\n${usernameData.response.response}`,
          "info"
        )
      } else {
        // Fallback to showing the raw JSON
        addTerminalLine(
          "Username API raw output: " +
            JSON.stringify(usernameData.response, null, 2),
          "info"
        )
      }

      addTerminalLine("Saving user information...", "command")
      // Save new user record in the social_posts table
      const { error: insertError } = await supabase
        .from("social_posts")
        .insert([
          {
            platform: "twitter",
            username,
            raw_content: usernameData.response,
            content: "",
          },
        ])

      if (insertError) throw insertError

      addTerminalLine("User data saved successfully", "success")
      setUsernameVerified(true)
      setShowUrlInput(true)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error"
      addTerminalLine(`Error: ${errorMessage}`, "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTweets([])
    setEditableTweets([])

    try {
      addTerminalLine("Starting URL analysis...", "command")
      const urlResponse = await fetch(
        "https://api-lr.agent.ai/v1/agent/9xgko4mdmqambne0/webhook/ac042486",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_URL: url,
            user_question: urlQuery,
          }),
        }
      )
      if (!urlResponse.ok) throw new Error("URL analysis failed")
      const urlData = await urlResponse.json()
      addTerminalLine(urlData.response.response, "info")

      addTerminalLine("Generating Twitter thread...", "command")
      const tweetResponse = await fetch(
        "https://api-lr.agent.ai/v1/agent/i0v6lj26fu5sfw9x/webhook/9e2806c6",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_analysis: terminalLines.map((l) => l.text).join("\n"),
            url_analysis: urlData.response.response,
            thread_about: urlQuery,
          }),
        }
      )
      if (!tweetResponse.ok) throw new Error("Thread generation failed")
      const tweetData = await tweetResponse.json()
      const generatedThread = tweetData.response.response
      const tweetParts = generatedThread.split("#@").slice(1)
      const parsedTweets = tweetParts.map((part: string) =>
        part.split("@#")[0].trim()
      )

      if (parsedTweets.length !== 7) {
        throw new Error("Thread must contain exactly 7 tweets")
      }

      setTweets(parsedTweets)
      setEditableTweets([...parsedTweets])
      setGenerationVersion((prev) => prev + 1)
      addTerminalLine("Thread generated successfully", "success")
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error"
      addTerminalLine(`Error: ${errorMessage}`, "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegenerate = async () => {
    if (!usernameVerified) return
    await handleUrlSubmit(new Event("submit") as any)
  }

  const handleSave = async () => {
    if (!username || editableTweets.length === 0) {
      addTerminalLine("Error: Missing required data to save", "error")
      return
    }

    try {
      addTerminalLine("Saving thread to database...", "command")
      // Convert tweets array to single string
      const postContent = editableTweets.join("\n\n")

      const { error } = await supabase
        .from("twitter_posts")
        .insert([
          {
            twitter_username: username,
            post_content: postContent,
            img_url: null, // Add image URL if available
          },
        ])

      if (error) throw error
      addTerminalLine("Thread saved successfully!", "success")
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Database error"
      addTerminalLine(`Save failed: ${errorMessage}`, "error")
      console.error("Supabase save error:", error)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(editableTweets.join("\n\n"))
      addTerminalLine("Copied to clipboard", "success")
    } catch (error) {
      addTerminalLine("Failed to copy", "error")
    }
  }

  const ThreadPreview = () => {
    const displayTweets =
      editableTweets.length > 0 ? editableTweets : dummyTweets

    return (
      <div className="space-y-6">
        {displayTweets.map((tweet, index) => (
          <div key={index} className="relative group">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                  <Twitter className="h-5 w-5 text-cyan-400" />
                </div>
                {index < 6 && (
                  <div className="flex-1 w-px bg-cyan-500/20 my-2" />
                )}
              </div>
              <div className="flex-1">
                <div className="mb-2">
                  <span className="font-bold text-cyan-300">
                    @{username || "username"}
                  </span>
                  <span className="text-cyan-500/70 text-sm ml-2">
                    Tweet {index + 1}
                  </span>
                </div>
                {editableTweets.length > 0 ? (
                  isEditing ? (
                    <textarea
                      value={tweet}
                      onChange={(e) => {
                        const newTweets = [...editableTweets]
                        newTweets[index] = e.target.value
                        setEditableTweets(newTweets)
                      }}
                      className="w-full bg-gray-800/50 text-cyan-300 p-3 rounded-lg border border-cyan-500/30"
                      rows={3}
                    />
                  ) : (
                    <div className="text-cyan-300 whitespace-pre-wrap bg-gray-800/50 p-4 rounded-lg border border-cyan-500/20">
                      <ReactMarkdown className="prose-invert">
                        {tweet}
                      </ReactMarkdown>
                    </div>
                  )
                ) : (
                  <div className="text-cyan-500/40 italic p-4 bg-gray-900/20 rounded-lg border border-dashed border-cyan-500/20">
                    {tweet}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-gray-900 font-mono overflow-hidden crt-effect">
      <div className="w-1/2 flex flex-col border-r border-cyan-500/20">
        <motion.div
          className="p-8 border-b border-cyan-500/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/choose-post-type"
              className="mr-2 hover:text-cyan-300 transition-colors"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1 rounded-lg hover:bg-cyan-500/10"
              >
                <ArrowLeft className="h-6 w-6 text-cyan-400" />
              </motion.div>
            </Link>

            <motion.div
              initial={{ rotate: -15 }}
              animate={{ rotate: 0 }}
              transition={{ type: "spring" }}
            >
              <Twitter className="text-cyan-400 h-8 w-8" />
            </motion.div>
            <motion.h1
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              className="text-2xl font-bold text-cyan-400 glow-text"
            >
              TWITTER ANALYZER
            </motion.h1>
          </div>

          <form onSubmit={handleUsernameSubmit}>
            <div className="flex gap-4">
              <motion.input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username (without @)"
                className="w-full px-4 py-3 bg-gray-800 rounded-lg border border-cyan-500/30 text-cyan-300 placeholder-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 pulse-border"
                disabled={usernameVerified}
                whileFocus={{ scale: 1.02 }}
              />
              <motion.button
                type="submit"
                disabled={isLoading || usernameVerified}
                className="px-6 py-3 bg-cyan-500/10 text-cyan-300 rounded-lg border border-cyan-500/30 hover:bg-cyan-500/20 disabled:opacity-50 relative"
                whileHover={{ scale: isLoading ? 1 : 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="h-2 w-2 bg-cyan-500 rounded-full"
                    />
                    ANALYZING
                  </div>
                ) : (
                  "ANALYZE"
                )}
                <AnimatePresence>
                  {usernameVerified && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -right-2 -top-2"
                    >
                      <CheckCircle className="h-5 w-5 text-cyan-500" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </form>

          <AnimatePresence>
            {showUrlInput && (
              <motion.form
                onSubmit={handleUrlSubmit}
                className="mt-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="space-y-4">
                  <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
                    <label className="block text-sm text-cyan-400 mb-2">
                      Enter a URL to analyze
                    </label>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 rounded-lg border border-cyan-500/30 text-cyan-300 placeholder-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      required
                    />
                  </motion.div>
                  <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
                    <label className="block text-sm text-cyan-400 mb-2">
                      What is the Thread about?
                    </label>
                    <textarea
                      value={urlQuery}
                      onChange={(e) => setUrlQuery(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 rounded-lg border border-cyan-500/30 text-cyan-300 placeholder-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 h-32"
                      required
                    />
                  </motion.div>
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-6 py-3 bg-cyan-500/10 text-cyan-300 rounded-lg border border-cyan-500/30 hover:bg-cyan-500/20"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        PROCESSING...
                      </motion.div>
                    ) : (
                      "GENERATE THREAD"
                    )}
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          className="flex-1 bg-black/50 p-6 overflow-y-auto glow-terminal"
          animate={{ height: showUrlInput ? "50%" : "100%" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <div className="flex items-center gap-2 mb-4 text-cyan-400">
            <Terminal className="h-5 w-5" />
            <span className="text-sm">ANALYSIS TERMINAL</span>
          </div>
          <div className="space-y-2 text-sm">
            <AnimatePresence>
              {visibleLines.map((line, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className={`${
                    line.type === "command"
                      ? "text-cyan-300"
                      : line.type === "success"
                      ? "text-green-400"
                      : line.type === "error"
                      ? "text-red-400"
                      : "text-cyan-200"
                  } terminal-line`}
                >
                  {line.type === "command" && (
                    <span className="text-cyan-500 mr-2">$</span>
                  )}
                  <ReactMarkdown className="inline">{line.text}</ReactMarkdown>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={terminalEndRef} />
          </div>
        </motion.div>
      </div>

      <div className="w-1/2 bg-black/90 border-l border-cyan-500/20 p-8 glow-box">
        <motion.div
          className="h-full flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <motion.div
              className="bg-cyan-500 p-2 rounded-full"
              animate={{ rotate: [0, 15, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
            >
              <Twitter className="h-6 w-6 text-black" />
            </motion.div>
            <div>
              <div className="font-bold text-cyan-300">
                @{username || "username"}
              </div>
              <div className="text-cyan-500/70 text-sm">GENERATED THREAD</div>
            </div>
          </div>

          <div className="flex-1 bg-gray-900/50 rounded-xl p-6 border border-cyan-500/20 overflow-y-auto">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <motion.h3
                  className="text-cyan-400 text-sm font-medium"
                  animate={{ x: [0, 2, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  Thread Preview
                </motion.h3>
                <div className="flex gap-2">
                  <motion.button
                    onClick={copyToClipboard}
                    className="px-3 py-1 bg-cyan-500/10 text-cyan-300 rounded-lg border border-cyan-500/30 hover:bg-cyan-500/20 flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Copy size={16} /> Copy
                  </motion.button>
                  <motion.button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-3 py-1 bg-cyan-500/10 text-cyan-300 rounded-lg border border-cyan-500/30 hover:bg-cyan-500/20 flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Edit3 size={16} /> {isEditing ? "Preview" : "Edit"}
                  </motion.button>
                </div>
              </div>

              <ThreadPreview />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <motion.button
                onClick={handleSave}
                disabled={editableTweets.length === 0}
                className="px-4 py-2 bg-cyan-500/10 text-cyan-300 rounded-lg border border-cyan-500/30 hover:bg-cyan-500/20 flex items-center gap-2 disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Save size={18} />
                Save Thread
              </motion.button>
              <motion.button
                onClick={handleRegenerate}
                className="px-4 py-2 bg-cyan-500/10 text-cyan-300 rounded-lg border border-cyan-500/30 hover:bg-cyan-500/20 flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw size={18} />
                Regenerate
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
