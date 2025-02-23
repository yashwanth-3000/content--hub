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

// Helper function to call IBM Profile Analysis API (from your single tweet generator)
const callIBMProfileAnalysis = async (
  ibmInput: string,
  addTerminalLine: (text: string, type?: TerminalLineType) => void
): Promise<string> => {
  try {
    addTerminalLine("Calling IBM Profile Analysis API...", "command")
    const ibmApiResponse = await fetch("/api/ibm-profile-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: ibmInput,
        parameters: {
          decoding_method: "greedy",
          max_new_tokens: 8000,
          min_new_tokens: 0,
          stop_sequences: [],
          repetition_penalty: 1,
        },
        model_id: "ibm/granite-3-8b-instruct",
        project_id: "b44a8ace-b7f0-49d7-b212-da6ce8d60825",
      }),
    })
    if (!ibmApiResponse.ok)
      throw new Error("IBM Profile Analysis API call failed")
    const ibmData = await ibmApiResponse.json()
    const analysisText =
      ibmData.results?.[0]?.generated_text || "No analysis generated"
    addTerminalLine("Profile analysis completed.", "success")
    addTerminalLine("Generated profile analysis: " + analysisText, "success")
    return analysisText
  } catch (error) {
    console.error("Error in callIBMProfileAnalysis:", error)
    throw error
  }
}

// Helper function to call IBM API for tweet thread generation (similar to your single tweet generator)
const callIBMTweetThreadGeneration = async (
  prompt: string,
  addTerminalLine: (text: string, type?: TerminalLineType) => void
): Promise<string> => {
  try {
    addTerminalLine("Calling IBM Tweet Thread Generation API...", "command")
    const ibmApiResponse = await fetch("/api/ibm-profile-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: prompt,
        parameters: {
          decoding_method: "greedy",
          max_new_tokens: 800,
          min_new_tokens: 0,
          stop_sequences: [],
          repetition_penalty: 1,
        },
        model_id: "ibm/granite-3-8b-instruct",
        project_id: "b44a8ace-b7f0-49d7-b212-da6ce8d60825",
      }),
    })
    if (!ibmApiResponse.ok)
      throw new Error("IBM Tweet Thread Generation API call failed")
    const ibmData = await ibmApiResponse.json()
    const threadText =
      ibmData.results?.[0]?.generated_text || "No thread generated"
    addTerminalLine("Tweet thread generation completed.", "success")
    addTerminalLine("Generated thread: " + threadText, "success")
    return threadText
  } catch (error) {
    console.error("Error in callIBMTweetThreadGeneration:", error)
    throw error
  }
}

export default function AnalysisPage() {
  const [username, setUsername] = useState("")
  const [url, setUrl] = useState("")
  const [urlQuery, setUrlQuery] = useState("")
  const [analysisOption, setAnalysisOption] = useState("event") // "event", "yt", or "none"
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
  const [profileAnalysis, setProfileAnalysis] = useState("")
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

      let profileData = null

      if (existingUser) {
        addTerminalLine("Found existing user data", "success")
        addTerminalLine(
          JSON.stringify(existingUser.raw_content, null, 2),
          "info"
        )
        // Immediately trigger profile analysis using the found data
        profileData = existingUser.raw_content
      } else {
        addTerminalLine("User not found in database, calling external Twitter analysis...", "command")
        const usernameResponse = await fetch(
          "https://api-lr.agent.ai/v1/agent/sa3zhs11qxhjbd8t/webhook/8e25ef47",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ twitter_name: username }),
          }
        )
        if (!usernameResponse.ok)
          throw new Error("Username analysis failed")
        const usernameData = await usernameResponse.json()
        // Display the result based on structure
        if (Array.isArray(usernameData.response)) {
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
          addTerminalLine(
            "Username API raw output: " +
              JSON.stringify(usernameData.response, null, 2),
            "info"
          )
        }
        profileData = usernameData.response
        addTerminalLine("Saving new user information...", "command")
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
      }

      // Build the IBM prompt for profile analysis using the profileData
      const ibmInput = `<|start_of_role|>system<|end_of_role|>

**Social Media Profile Analysis**

Your role is to analyze JSON-formatted data representing a user's Twitter profile. Focus on extracting insights about the user's writing style, tone, language, and creative expression from their tweets. Ignore retweets and focus solely on original content.

Input Data:
${JSON.stringify(profileData, null, 2)}

Output: A detailed profile analysis report summarizing the user's tone, word choice, narrative style, and overall persona.
`
      const analysisReport = await callIBMProfileAnalysis(ibmInput, addTerminalLine)
      setProfileAnalysis(analysisReport)
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
      let urlAnalysis = ""

      if (analysisOption === "yt") {
        addTerminalLine("Sending YouTube video URL to API...", "command")
        const ytResponse = await fetch(
          "https://api-lr.agent.ai/v1/agent/0usvm0kxa18r1fs6/webhook/7243feda",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ yt_url: url }),
          }
        )
        if (!ytResponse.ok) throw new Error("YT video API call failed")
        const ytData = await ytResponse.json()
        addTerminalLine("YT Video API call successful.", "success")
        addTerminalLine(
          "YT Video API raw output: " + JSON.stringify(ytData, null, 2),
          "success"
        )
        urlAnalysis = JSON.stringify(ytData, null, 2)
      } else if (analysisOption === "event") {
        addTerminalLine("Starting event URL analysis...", "command")
        const eventResponse = await fetch(
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
        if (!eventResponse.ok) throw new Error("Event URL analysis failed")
        const eventData = await eventResponse.json()
        addTerminalLine("Event API call successful.", "success")
        addTerminalLine(
          "Event API raw output: " +
            JSON.stringify(eventData.response, null, 2),
          "success"
        )
        urlAnalysis = JSON.stringify(eventData.response, null, 2)
      } else {
        addTerminalLine("No external URL analysis selected.", "command")
        urlAnalysis = ""
      }

      // Build different system prompts based on the selected option.
      let systemPrompt = ""
      if (analysisOption === "yt") {
        systemPrompt = `System Prompt:
You are an expert tweet thread generator with deep knowledge of social media language.
Using the following profile analysis:
${profileAnalysis}
and the YouTube video context:
${urlAnalysis}
Generate exactly 7 engaging tweets that reflect the user's unique voice and incorporate insights from the video.
The thread topic is:
${urlQuery}
Each tweet must start with "#@" and end with "@#".
Output: A Twitter thread with exactly 7 tweets following the above format.`
      } else if (analysisOption === "event") {
        systemPrompt = `System Prompt:
You are an expert tweet thread generator with a keen understanding of social media language.
Using the following profile analysis:
${profileAnalysis}
and the event/article context:
${urlAnalysis}
Generate exactly 7 engaging tweets that reflect the user's style and capture key aspects of the event.
The thread topic is:
${urlQuery}
Each tweet must start with "#@" and end with "@#".
Output: A Twitter thread with exactly 7 tweets following the above format.`
      } else if (analysisOption === "none") {
        systemPrompt = `System Prompt:
You are an expert tweet thread generator with a deep understanding of social media language.
Using the following profile analysis:
${profileAnalysis}
Generate exactly 7 engaging tweets that reflect the user's unique voice without incorporating any external context.
The thread topic is:
${urlQuery}
Each tweet must start with "#@" and end with "@#".
Output: A Twitter thread with exactly 7 tweets following the above format.`
      }

      addTerminalLine("Generating Twitter thread...", "command")
      const threadText = await callIBMTweetThreadGeneration(systemPrompt, addTerminalLine)
      // Parse the thread using the delimiters "#@" and "@#"
      const tweetParts = threadText.split("#@").slice(1)
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
      const postContent = editableTweets.join("\n\n")

      const { error } = await supabase
        .from("social_media_posts")
        .insert([
          {
            platform: "twitter_thread",
            username: username,
            content: postContent,
            img_url: null,
            created_at: new Date().toISOString(),
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
                  {/* Button slider for analysis option */}
                  <motion.div
                    className="flex gap-2 mb-4"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    {["event", "yt", "none"].map((option) => {
                      const label =
                        option === "event"
                          ? "Event/article URL"
                          : option === "yt"
                          ? "YT video"
                          : "None"
                      return (
                        <motion.button
                          key={option}
                          type="button"
                          onClick={() => setAnalysisOption(option)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-4 py-2 rounded-lg border transition-colors duration-300 ${
                            analysisOption === option
                              ? "bg-cyan-500 text-white shadow-lg"
                              : "bg-cyan-500/10 text-cyan-300"
                          }`}
                        >
                          {label}
                        </motion.button>
                      )
                    })}
                  </motion.div>

                  {/* Conditionally show URL input if analysis option is not "none" */}
                  {analysisOption !== "none" && (
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
                  )}

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