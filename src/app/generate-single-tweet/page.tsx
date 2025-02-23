"use client"

/**
 * Setup Guide:
 *
 * 1. In your IBM Cloud account, create an API key for IAM.
 * 2. In your project’s environment variables (e.g., .env.local), add:
 *      IBM_API_KEY=your_ibm_api_key_here
 *      NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
 *      NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
 * 3. Restart your development server so that the new environment variables take effect.
 */

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@supabase/supabase-js"
import {
  Terminal,
  CheckCircle,
  Twitter,
  Copy,
  Download,
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
  const [tweetContent, setTweetContent] = useState("")
  const [editableContent, setEditableContent] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  // Slider options: "event", "yt", or "none"
  const [analysisOption, setAnalysisOption] = useState("event")
  // Store the user profile analysis (from IBM API)
  const [userProfileAnalysis, setUserProfileAnalysis] = useState("")

  const terminalEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll terminal when new lines are added.
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

  // Call IBM Profile Analysis API (used during user profile analysis)
  const callIBMProfileAnalysis = async (ibmInput: string): Promise<string> => {
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
      if (!ibmApiResponse.ok) throw new Error("IBM Profile Analysis API call failed")
      const ibmData = await ibmApiResponse.json()
      const generatedText = ibmData.results?.[0]?.generated_text || "No analysis generated"
      addTerminalLine("Profile analysis completed.", "success")
      addTerminalLine("Generated analysis: " + generatedText, "success")
      return generatedText
    } catch (error) {
      console.error("Error in callIBMProfileAnalysis:", error)
      throw error
    }
  }

  // New function: Call IBM to generate a tweet based on context.
  const callIBMTweetGeneration = async (prompt: string): Promise<string> => {
    try {
      addTerminalLine("Calling IBM Tweet Generation API...", "command")
      const ibmApiResponse = await fetch("/api/ibm-profile-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: prompt,
          parameters: {
            decoding_method: "greedy",
            max_new_tokens: 200, // limit tweet length
            min_new_tokens: 10,
            stop_sequences: [],
            repetition_penalty: 1,
          },
          model_id: "ibm/granite-3-8b-instruct",
          project_id: "b44a8ace-b7f0-49d7-b212-da6ce8d60825",
        }),
      })
      if (!ibmApiResponse.ok) throw new Error("IBM Tweet Generation API call failed")
      const ibmData = await ibmApiResponse.json()
      const tweetText = ibmData.results?.[0]?.generated_text || "No tweet generated"
      addTerminalLine("Tweet generation completed.", "success")
      addTerminalLine("Generated tweet: " + tweetText, "success")
      return tweetText
    } catch (error) {
      console.error("Error in callIBMTweetGeneration:", error)
      throw error
    }
  }

  // --- USERNAME PROFILE ANALYSIS (Without saving IBM content) ---
  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTerminalLines([])
    setVisibleLines([])
    setTweetContent("")
    setImageUrl("")
    setEditableContent("")

    try {
      addTerminalLine(`Checking database for ${username}...`, "command")
      const { data: existingUser, error: dbError } = await supabase
        .from("social_posts")
        .select("raw_content, content")
        .eq("platform", "twitter")
        .eq("username", username)
        .single()

      let profileData: any
      if (dbError && dbError.code !== "PGRST116") {
        console.error("Supabase query error:", dbError)
        throw dbError
      }

      if (existingUser) {
        addTerminalLine("Found existing user data in database.", "success")
        addTerminalLine("Supabase data: " + JSON.stringify(existingUser, null, 2), "success")
        profileData = existingUser.raw_content
        setShowUrlInput(true)
      } else {
        // If user not found, call external Twitter analysis API.
        addTerminalLine("User not found in Supabase. Calling external Twitter analysis API...", "command")
        const twitterResponse = await fetch("https://api-lr.agent.ai/v1/agent/sa3zhs11qxhjbd8t/webhook/8e25ef47", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ twitter_name: username }),
        })
        if (!twitterResponse.ok) throw new Error("External Twitter analysis API call failed")
        const twitterData = await twitterResponse.json()
        addTerminalLine("External Twitter analysis API call successful.", "success")
        addTerminalLine("External API raw output: " + JSON.stringify(twitterData, null, 2), "success")
        profileData = twitterData.response ? twitterData.response : twitterData
        // Save new account data.
        addTerminalLine("Saving new Twitter account data...", "command")
        const { error: insertError } = await supabase
          .from("social_posts")
          .insert([
            {
              platform: "twitter",
              username: username,
              raw_content: profileData,
              content: "",
            },
          ])
        if (insertError) throw insertError
        addTerminalLine("Account data saved successfully", "success")
        setShowUrlInput(true)
      }

      const ibmInput = `<|start_of_role|>system<|end_of_role|>

**Social Media Profile Analysis**

Your role is to analyze JSON-formatted data representing a user's profile from Twitter or LinkedIn, with a primary focus on understanding and describing how the user writes and expresses themselves. Follow these steps:

### 1. Input Validation
- **Data Format:** Confirm that the input is valid JSON containing the user's profile details, posts (tweets, captions, descriptions), and associated metadata.
- **Platform Identification:** Determine whether the data is from Twitter or LinkedIn.

### 2. Platform-Specific Filtering
- **Twitter:**  
  - Analyze only the user's original tweets.
  - Exclude any tweet that contains the string "@RT" (indicating retweets).
  
- **LinkedIn:**  
  - Focus exclusively on the user's original posts.
  - Remove any reposted or shared content from your analysis.

### 3. In-Depth Analysis of Writing Style
- **Tone and Voice:**  
  - Evaluate whether the user's tone is formal, casual, humorous, sarcastic, or another distinctive style.
  - Observe any consistency or shifts in tone across different posts.
  
- **Language and Word Choice:**  
  - Examine vocabulary, sentence structure, and clarity.
  - Identify any use of slang, technical language, or industry-specific jargon.
  - Assess the originality of the language and the creativity in word choice.
  
- **Narrative and Expression:**  
  - Look for creative writing elements like metaphors, analogies, and storytelling.
  - Consider how these techniques contribute to the users overall persona and unique writing style.
  
- **Content Originality:**  
  - Base your analysis solely on the users original content as determined by the filtering rules above.

### 4. Structured Report and Final Lists
- **Report Structure:**  
  - Produce a well-organized, human-readable report with clear sections or bullet points.
  - Summarize key insights about the users tone, vocabulary, creative expression, and recurring stylistic themes.
  
- **Final Lists:**  
  - At the end of the report, provide:
    - A complete list of all original tweets (excluding tweets with "@RT").
    - Or, if analyzing LinkedIn, a complete list of all original posts (excluding reposted content).

Your analysis should deeply focus on the users personal writing style, capturing the nuances of their language, the consistency or evolution in their tone, and the creative flair evident in their posts.

---

---<|end_of_text|>
<|start_of_role|>user<|end_of_role|>data : ${JSON.stringify(profileData)} <|end_of_text|>
`
      const analysisReport = await callIBMProfileAnalysis(ibmInput)
      addTerminalLine("IBM analysis complete. (Not saved to Supabase, not shown in preview)", "success")
      setUserProfileAnalysis(analysisReport)
      setUsernameVerified(true)
    } catch (error) {
      console.error("Error in handleUsernameSubmit:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      addTerminalLine(`Error: ${errorMessage}`, "error")
    } finally {
      setIsLoading(false)
    }
  }

  // --- URL ANALYSIS & TWEET GENERATION ---
  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTweetContent("")
    setImageUrl("")

    try {
      let additionalContext = ""
      if (analysisOption === "yt") {
        addTerminalLine("Sending YouTube video URL to API...", "command")
        const ytResponse = await fetch("https://api-lr.agent.ai/v1/agent/0usvm0kxa18r1fs6/webhook/7243feda", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ yt_url: url }),
        })
        if (!ytResponse.ok) throw new Error("YT video API call failed")
        const ytData = await ytResponse.json()
        addTerminalLine("YT Video API call successful.", "success")
        addTerminalLine("YT Video API raw output:", "success")
        addTerminalLine(JSON.stringify(ytData, null, 2), "success")
        additionalContext = JSON.stringify(ytData, null, 2)
      } else if (analysisOption === "event") {
        addTerminalLine("Starting event URL analysis...", "command")
        const urlResponse = await fetch("https://api-lr.agent.ai/v1/agent/9xgko4mdmqambne0/webhook/ac042486", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            analysisOption: analysisOption,
            user_URL: url,
            user_question: urlQuery,
          }),
        })
        if (!urlResponse.ok) throw new Error("Event URL analysis failed")
        const urlData = await urlResponse.json()
        addTerminalLine("Event API call successful.", "success")
        addTerminalLine("Event API raw output:", "success")
        addTerminalLine(JSON.stringify(urlData.response, null, 2), "success")
        additionalContext = JSON.stringify(urlData.response, null, 2)
      } else if (analysisOption === "none") {
        addTerminalLine("No external URL provided. Using only tweet query and profile analysis.", "command")
        additionalContext = ""
      }

      // Build a system prompt for tweet generation.
      let tweetPrompt = ""
      if (analysisOption === "none") {
        tweetPrompt = `System Prompt:
You are an expert tweet generator with a deep understanding of social media language and stylistic nuance. Your objective is to craft a single tweet that captures the essence of the user's unique voice, tone, and style by analyzing the user's tweet text, not by directly reusing any of their previous tweets. Additionally, incorporate relevant details from the tweet query to ensure the tweet is both topical and engaging.

Instructions:
1. Analyze the "User Profile Analysis" to extract the user's distinctive language, tone, and recurring stylistic quirks from their tweet text.
2. Do not directly copy any existing tweet; instead, synthesize a new tweet that embodies the user's unique style.
3. Seamlessly integrate key elements from the "Tweet Query" to ensure the tweet is contextually rich and aligns with the querys intent.
4. Ensure the tweet is concise, engaging, and reflective of the user's personality while adhering to the platform's character limit (280 characters or fewer).
5. Do not include any extra text, labels, or commentary—output only the final tweet text.

User Profile Analysis:
${userProfileAnalysis}

Tweet Query:
${urlQuery}

Output: A single, original tweet that incorporates the provided query context while perfectly mirroring the user's tweet style.`;

      } else {
        tweetPrompt = `System Prompt:
You are an expert tweet generator with a deep understanding of social media language and stylistic nuance. 
Your objective is to craft a single tweet that perfectly mimics the user's unique voice, tone,
and style as described in the provided user profile analysis. You will also integrate relevant details
from additional context—such as insights from a current event or a YouTube video—to ensure the tweet is topical and engaging.

Instructions:
1. Use the "User Profile Analysis" to capture the user's distinctive language, tone, interests, and stylistic quirks.
2. Incorporate key details from the "Additional Context" to make the tweet relevant and timely.
3. Ensure the tweet is concise, engaging, and tailored to the user's personality.
5. The tweet should adhere to the character limit (280 characters or fewer) typical of the platform.
6. Do not include any extra text,like Tweet: " " only give the tweet text thats it and also do not inlcude commentary, or explanation—output only the final tweet text. 

User Profile Analysis:
${userProfileAnalysis}

Additional Context:
${additionalContext}

Tweet Query:
${urlQuery}
Output: A single, original tweet that incorporates the given context.
`
      }

      const generatedTweet = await callIBMTweetGeneration(tweetPrompt)
      setTweetContent(generatedTweet)
      setEditableContent(generatedTweet)
      addTerminalLine("Tweet generation API call successful.", "success")
      addTerminalLine("Tweet generated successfully", "success")

      addTerminalLine("Generating tweet image...", "command")
      const imageResponse = await fetch("https://api-lr.agent.ai/v1/agent/jzdtshn6u3sz625y/webhook/858144e2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Tweet_text: generatedTweet }),
      })
      if (!imageResponse.ok) throw new Error("Image generation failed")
      const imageData = await imageResponse.json()
      let imgTag: string | undefined;
      if (imageData.response && imageData.response.response) {
        imgTag = imageData.response.response;
      } else if (imageData.response && typeof imageData.response === "string") {
        imgTag = imageData.response;
      } else if (typeof imageData === "string") {
        imgTag = imageData;
      }
      if (imgTag && typeof imgTag === "string") {
        const srcMatch = imgTag.match(/src="([^"]+)"/);
        if (srcMatch && srcMatch[1]) {
          setImageUrl(srcMatch[1]);
          addTerminalLine("Image generation API call successful.", "success")
          addTerminalLine("Image generated successfully", "success")
        } else {
          addTerminalLine("Could not extract image URL from the API response", "error")
        }
      } else {
        addTerminalLine("Image API returned an unexpected structure", "error")
      }
    } catch (error) {
      console.error("Error in handleUrlSubmit:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      addTerminalLine(`Error: ${errorMessage}`, "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegenerate = async () => {
    if (!usernameVerified) return
    await handleUrlSubmit(new Event("submit") as any)
  }

  // --- SAVE THE GENERATED TWEET ---
  const handleSave = async () => {
    if (!username) {
      addTerminalLine("Error: Missing username", "error")
      return
    }
    try {
      addTerminalLine("Saving post to database...", "command")
      const contentToSave = editableContent.trim() || "No content generated"
      const rawContent = {
        tweet: contentToSave,
        image_url: imageUrl || "No image generated",
      }
      const { error } = await supabase
        .from("social_media_posts")
        .insert([
          {
            platform: "twitter",
            username: username,
            content: contentToSave,
            img_url: imageUrl,
            created_at: new Date().toISOString(),
          },
        ])
      if (error) {
        console.error("Supabase insert error:", error)
        addTerminalLine("Supabase insert error: " + error.message, "error")
        throw error
      }
      addTerminalLine("Post saved successfully!", "success")
    } catch (error) {
      console.error("Error in handleSave:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      addTerminalLine(`Save failed: ${errorMessage}`, "error")
    }
  }
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(editableContent)
      addTerminalLine("Copied to clipboard", "success")
    } catch (error) {
      console.error("Error copying to clipboard:", error)
      addTerminalLine("Failed to copy", "error")
    }
  }

  const downloadImage = () => {
    if (!imageUrl) return
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = `tweet-${Date.now()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="h-screen flex bg-gradient-to-br from-gray-900 to-gray-800 font-mono overflow-hidden crt-effect">
      <div className="w-1/2 flex flex-col border-r border-cyan-500/20">
        <div className="p-8 border-b border-cyan-500/20">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/choose-post-type" className="mr-2 hover:text-cyan-300 transition-colors">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-1 rounded-lg hover:bg-cyan-500/10">
                <ArrowLeft className="h-6 w-6 text-cyan-400" />
              </motion.div>
            </Link>
            <Twitter className="text-cyan-400 h-8 w-8" />
            <h1 className="text-2xl font-bold text-cyan-400 glow-text">TWITTER ANALYZER</h1>
          </div>
          <form onSubmit={handleUsernameSubmit}>
            <div className="flex gap-4">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username (without @)"
                className="w-full px-4 py-3 bg-gray-800 rounded-lg border border-cyan-500/30 text-cyan-300 placeholder-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300"
                disabled={usernameVerified}
              />
              <motion.button
                type="submit"
                disabled={isLoading || usernameVerified}
                className="px-6 py-3 bg-cyan-500/10 text-cyan-300 rounded-lg border border-cyan-500/30 hover:bg-cyan-500/20 disabled:opacity-50 relative"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-cyan-500 rounded-full animate-bounce" />
                    ANALYZING
                  </div>
                ) : (
                  "ANALYZE"
                )}
                <AnimatePresence>
                  {usernameVerified && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -right-2 -top-2">
                      <CheckCircle className="h-5 w-5 text-cyan-500" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </form>
          <AnimatePresence>
            {showUrlInput && (
              <motion.form onSubmit={handleUrlSubmit} className="mt-6" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="space-y-4">
                  {/* Animated Button Slider for Analysis Option */}
                  <motion.div className="flex gap-2 mb-4" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    {["event", "yt", "none"].map((option) => {
                      const label =
                        option === "event"
                          ? "Event/article url"
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
                  {/* Conditional Input based on Selected Option */}
                  <AnimatePresence mode="wait">
                    {analysisOption !== "none" && (
                      <motion.div key={analysisOption} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                        {analysisOption === "event" ? (
                          <>
                            <label className="block text-sm text-cyan-400 mb-2">
                              Enter a URL to analyze, such as an event page or an article link.
                            </label>
                            <input
                              type="url"
                              value={url}
                              onChange={(e) => setUrl(e.target.value)}
                              placeholder="Enter event or article URL"
                              className="w-full px-4 py-3 bg-gray-800 rounded-lg border border-cyan-500/30 text-cyan-300 placeholder-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300"
                              required
                            />
                          </>
                        ) : analysisOption === "yt" ? (
                          <>
                            <label className="block text-sm text-cyan-400 mb-2">
                              Enter a YouTube video URL.
                            </label>
                            <input
                              type="url"
                              value={url}
                              onChange={(e) => setUrl(e.target.value)}
                              placeholder="Enter YouTube video URL"
                              className="w-full px-4 py-3 bg-gray-800 rounded-lg border border-cyan-500/30 text-cyan-300 placeholder-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300"
                              required
                            />
                          </>
                        ) : null}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div>
                    <label className="block text-sm text-cyan-400 mb-2">
                      What is the Tweet about?
                    </label>
                    <textarea
                      value={urlQuery}
                      onChange={(e) => setUrlQuery(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 rounded-lg border border-cyan-500/30 text-cyan-300 placeholder-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 h-32 transition-all duration-300"
                      required
                    />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-6 py-3 bg-cyan-500/10 text-cyan-300 rounded-lg border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? "PROCESSING..." : "GENERATE CONTENT"}
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
        <motion.div className="flex-1 bg-black/50 p-6 overflow-y-auto glow-terminal" animate={{ height: showUrlInput ? "50%" : "100%" }} transition={{ duration: 0.5, ease: "easeInOut" }}>
          <div className="flex items-center gap-2 mb-4 text-cyan-400">
            <Terminal className="h-5 w-5" />
            <span className="text-sm">ANALYSIS TERMINAL</span>
          </div>
          <div className="space-y-2 text-sm">
            {visibleLines.map((line, index) => (
              <div key={index} className={`${
                line.type === "command"
                  ? "text-cyan-300"
                  : line.type === "success"
                  ? "text-green-400"
                  : line.type === "error"
                  ? "text-red-400"
                  : "text-cyan-200"
              } terminal-line`}>
                {line.type === "command" && <span className="text-cyan-500 mr-2">$</span>}
                <ReactMarkdown className="inline">{line.text}</ReactMarkdown>
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>
        </motion.div>
      </div>
      <div className="w-1/2 bg-black/90 border-l border-cyan-500/20 p-8 glow-box">
        <div className="h-full flex flex-col">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-cyan-500 p-2 rounded-full">
              <Twitter className="h-6 w-6 text-black" />
            </div>
            <div>
              <div className="font-bold text-cyan-300">@{username || "username"}</div>
              <div className="text-cyan-500/70 text-sm">GENERATED CONTENT</div>
            </div>
          </div>
          <div className="flex-1 bg-gray-900/50 rounded-xl p-6 border border-cyan-500/20 overflow-y-auto">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-cyan-400 text-sm font-medium">Caption</h3>
                <div className="flex gap-2">
                  <button onClick={copyToClipboard} className="px-3 py-1 bg-cyan-500/10 text-cyan-300 rounded-lg border border-cyan-500/30 hover:bg-cyan-500/20 flex items-center gap-2 transition-colors duration-300">
                    <Copy size={16} /> Copy
                  </button>
                  <button onClick={() => setIsEditing(!isEditing)} className="px-3 py-1 bg-cyan-500/10 text-cyan-300 rounded-lg border border-cyan-500/30 hover:bg-cyan-500/20 flex items-center gap-2 transition-colors duration-300">
                    <Edit3 size={16} /> Edit
                  </button>
                </div>
              </div>
              <div className="text-cyan-300 whitespace-pre-wrap">
                <ReactMarkdown
                  className="prose-invert"
                  components={{
                    h1: ({ node, ...props }) => <h1 className="text-yellow-400" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-yellow-400" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-yellow-400" {...props} />,
                    strong: ({ node, ...props }) => <strong className="text-cyan-400" {...props} />,
                  }}
                >
                  {editableContent || "// Generated Tweet Will appear here"}
                </ReactMarkdown>
              </div>
            </div>
            <div className="relative group">
              {imageUrl ? (
                <>
                  <motion.img initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={imageUrl} className="w-full h-auto rounded-lg border border-cyan-500/20" alt="Generated content" />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={downloadImage} className="p-2 bg-cyan-500/10 text-cyan-300 rounded-lg border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors duration-300">
                      <Download size={20} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="aspect-video bg-gray-900/30 rounded-lg flex items-center justify-center text-cyan-500/30 border-2 border-dashed border-cyan-500/20">
                  <span>IMAGE PREVIEW</span>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={handleSave} disabled={!editableContent || !imageUrl} className="px-4 py-2 bg-cyan-500/10 text-cyan-300 rounded-lg border border-cyan-500/30 hover:bg-cyan-500/20 flex items-center gap-2 disabled:opacity-50 transition-colors duration-300">
                <Save size={18} />
                Save Content
              </button>
              <button onClick={handleRegenerate} className="px-4 py-2 bg-cyan-500/10 text-cyan-300 rounded-lg border border-cyan-500/30 hover:bg-cyan-500/20 flex items-center gap-2 transition-colors duration-300">
                <RefreshCw size={18} />
                Regenerate Content
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}