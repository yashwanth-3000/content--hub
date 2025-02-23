"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@supabase/supabase-js"
import {
  Terminal,
  CheckCircle,
  Linkedin,
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

// Extract LinkedIn username from URL.
const extractUsername = (url: string): string => {
  const regex = /linkedin\.com\/in\/([^/?]+)/i
  const match = url.match(regex)
  return match ? match[1] : ""
}

// Process author info to set profile name, picture, and bio.
const processAuthor = (
  author: any,
  addTerminalLine: (text: string, type?: TerminalLineType) => void,
  setProfileName: (name: string) => void,
  setProfilePicture: (pic: string) => void,
  setProfileBio: (bio: string) => void
) => {
  if (author) {
    let fullName = ""
    if (author.profile_type === "company") {
      fullName = author.name || author.universal_name || ""
      setProfilePicture(author.logo_url || "")
      addTerminalLine("Detected company account", "info")
    } else {
      fullName =
        author.first_name && author.last_name
          ? `${author.first_name} ${author.last_name}`
          : author.profile_id || ""
      setProfilePicture(author.profile_picture || "")
      addTerminalLine("Detected personal account", "info")
    }
    setProfileName(fullName)
    setProfileBio(author.sub_title || "")
  } else {
    addTerminalLine("No author information found", "info")
  }
}

export default function LinkedInPage() {
  // URL and account states.
  const [inputUrl, setInputUrl] = useState("")
  const [username, setUsername] = useState("")
  const [profileName, setProfileName] = useState("")
  const [profilePicture, setProfilePicture] = useState("")
  const [profileBio, setProfileBio] = useState("")
  const [accountFetched, setAccountFetched] = useState(false)

  // Post details states.
  const [showPostForm, setShowPostForm] = useState(false)
  const [postUrl, setPostUrl] = useState("")
  const [postQuery, setPostQuery] = useState("")
  const [editableContent, setEditableContent] = useState("")
  // imageUrl will be generated via the image-generation API.
  const [imageUrl, setImageUrl] = useState("")

  // External analysis option: "event", "yt", or "none"
  const [analysisOption, setAnalysisOption] = useState("event")
  // Detailed profile analysis from IBM.
  const [userProfileAnalysis, setUserProfileAnalysis] = useState("")

  // Terminal log states.
  const [terminalLines, setTerminalLines] = useState<
    { text: string; type: TerminalLineType }[]
  >([])
  const [visibleLines, setVisibleLines] = useState<
    { text: string; type: TerminalLineType }[]
  >([])
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
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

  // Call IBM Profile Analysis API.
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
      const generatedText =
        ibmData.results?.[0]?.generated_text || "No analysis generated"
      addTerminalLine("Profile analysis completed.", "success")
      addTerminalLine("Generated analysis: " + generatedText, "success")
      return generatedText
    } catch (error) {
      console.error("Error in callIBMProfileAnalysis:", error)
      throw error
    }
  }

  // Call IBM Post Generation API.
  const callIBMPostGeneration = async (prompt: string): Promise<string> => {
    try {
      addTerminalLine("Calling IBM Post Generation API...", "command")
      const ibmApiResponse = await fetch("/api/ibm-profile-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: prompt,
          parameters: {
            decoding_method: "greedy",
            max_new_tokens: 1000,
            min_new_tokens: 50,
            stop_sequences: [],
            repetition_penalty: 1,
          },
          model_id: "ibm/granite-3-8b-instruct",
          project_id: "b44a8ace-b7f0-49d7-b212-da6ce8d60825",
        }),
      })
      if (!ibmApiResponse.ok) throw new Error("IBM Post Generation API call failed")
      const ibmData = await ibmApiResponse.json()
      const postText =
        ibmData.results?.[0]?.generated_text || "No post generated"
      addTerminalLine("Post generation completed.", "success")
      addTerminalLine("Generated post: " + postText, "success")
      return postText
    } catch (error) {
      console.error("Error in callIBMPostGeneration:", error)
      throw error
    }
  }

  // Return a valid (non-reposted) post from an array.
  const getValidPost = (posts: any[]) => {
    return posts.find((post) => {
      if (post.header_text && post.header_text.toLowerCase().includes("reposted")) {
        return false
      }
      return true
    })
  }

  // STEP 1: Analyze the LinkedIn account.
  const handleLinkedInSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Reset state.
    setTerminalLines([])
    setVisibleLines([])
    setEditableContent("")
    setImageUrl("") // Start with no image (placeholder will show)
    setUsername("")
    setProfileName("")
    setProfilePicture("")
    setProfileBio("")
    setAccountFetched(false)
    setShowPostForm(false)
    setUserProfileAnalysis("")

    const extractedUsername = extractUsername(inputUrl)
    if (!extractedUsername) {
      addTerminalLine("Step 1: Could not extract username from URL", "error")
      setIsLoading(false)
      return
    }
    addTerminalLine(`Step 1: Extracted username: ${extractedUsername}`, "info")

    // Check database for an existing record.
    addTerminalLine("Step 2: Checking database for existing record...", "info")
    const { data: existingRecord, error: dbError } = await supabase
      .from("social_posts")
      .select("raw_content, content")
      .eq("platform", "linkedin")
      .eq("username", extractedUsername)
      .single()

    let rawContent: any = null

    if (!dbError && existingRecord) {
      setUsername(extractedUsername)
      addTerminalLine("Step 3: Data loaded from database", "success")
      rawContent = existingRecord.raw_content
      addTerminalLine("Step 4: API Data from DB:", "info")
      addTerminalLine(JSON.stringify(rawContent, null, 2), "info")
    } else {
      addTerminalLine("Step 2: No record found in database. Calling external API...", "info")
      try {
        addTerminalLine(`Step 3: Analyzing LinkedIn account at URL: ${inputUrl}...`, "command")
        const responseRaw = await fetch(
          "https://api-lr.agent.ai/v1/agent/cv2ubaozjew6mcrt/webhook/672bc812",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ LinkedIn_url: inputUrl }),
          }
        )
        if (!responseRaw.ok) throw new Error("LinkedIn API request failed")
        const responseData = await responseRaw.json()
        rawContent = responseData
        const data = rawContent.response || rawContent
        const keys = Object.keys(data)
        if (keys.length === 0) throw new Error("Empty response from LinkedIn API")
        const linkedInUsername = keys[0]
        const accountData = data[linkedInUsername]

        setUsername(linkedInUsername)
        addTerminalLine(`Step 4: Extracted LinkedIn username: ${linkedInUsername}`, "success")

        if (accountData.posts && accountData.posts.length > 0) {
          const validPost = getValidPost(accountData.posts)
          if (validPost) {
            processAuthor(
              validPost.author,
              addTerminalLine,
              setProfileName,
              setProfilePicture,
              setProfileBio
            )
            // Do not set imageUrl from post attachments.
          } else {
            addTerminalLine("No valid non-reposted post found in API data", "info")
          }
        } else {
          addTerminalLine("Detected nothing from API posts", "info")
        }
        addTerminalLine("Step 5: API Data received:", "info")
        addTerminalLine(JSON.stringify(responseData, null, 2), "info")

        // Save the new account data to the database.
        addTerminalLine("Step 6: Saving new LinkedIn account data...", "command")
        const { error: insertError } = await supabase
          .from("social_posts")
          .insert([
            {
              platform: "linkedin",
              username: extractedUsername,
              raw_content: responseData,
              content: "",
            },
          ])
        if (insertError) throw insertError
        addTerminalLine("Step 7: Account data saved successfully", "success")
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        addTerminalLine(`Error: ${errorMessage}`, "error")
      }
    }

    // If record came from DB, extract account data.
    const data = rawContent.response || rawContent
    const keys = Object.keys(data)
    if (keys.length > 0) {
      const linkedInUsername = keys[0]
      const accountData = data[linkedInUsername]
      if (accountData && accountData.posts && accountData.posts.length > 0) {
        const validPost = getValidPost(accountData.posts)
        if (validPost) {
          processAuthor(
            validPost.author,
            addTerminalLine,
            setProfileName,
            setProfilePicture,
            setProfileBio
          )
        }
      }
    }

    // Immediately call IBM API for detailed profile analysis.
    try {
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
    <|start_of_role|>user<|end_of_role|>data : ${JSON.stringify(rawContent)} <|end_of_text|>
    `
      const analysisReport = await callIBMProfileAnalysis(ibmInput)
      setUserProfileAnalysis(analysisReport)
    } catch (err) {
      addTerminalLine("IBM profile analysis failed. Continuing without analysis.", "error")
    }

    setAccountFetched(true)
    setShowPostForm(true)
    setIsLoading(false)
  }

  // STEP 2: Generate post content.
  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setEditableContent("")
    let additionalContext = ""

    try {
      if (analysisOption === "yt") {
        addTerminalLine("Sending YouTube video URL to API...", "command")
        const ytResponse = await fetch(
          "https://api-lr.agent.ai/v1/agent/0usvm0kxa18r1fs6/webhook/7243feda",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ yt_url: postUrl }),
          }
        )
        if (!ytResponse.ok) throw new Error("YT video API call failed")
        const ytData = await ytResponse.json()
        addTerminalLine("YT Video API call successful.", "success")
        addTerminalLine("YT Video API raw output:", "success")
        addTerminalLine(JSON.stringify(ytData, null, 2), "success")
        additionalContext = JSON.stringify(ytData, null, 2)
      } else if (analysisOption === "event") {
        addTerminalLine("Starting event URL analysis...", "command")
        const urlResponse = await fetch(
          "https://api-lr.agent.ai/v1/agent/9xgko4mdmqambne0/webhook/ac042486",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              analysisOption: analysisOption,
              user_URL: postUrl,
              user_question: postQuery,
            }),
          }
        )
        if (!urlResponse.ok) throw new Error("Event URL analysis failed")
        const urlData = await urlResponse.json()
        addTerminalLine("Event API call successful.", "success")
        addTerminalLine("Event API raw output:", "success")
        addTerminalLine(JSON.stringify(urlData.response, null, 2), "success")
        additionalContext = JSON.stringify(urlData.response, null, 2)
      } else {
        addTerminalLine("No external URL provided. Using only post query and profile analysis.", "command")
      }

      let postPrompt = ""
      if (analysisOption === "none") {
        postPrompt = `System Prompt:
      You are an expert LinkedIn post generator with a deep understanding of professional social media language and stylistic nuance.
      Your objective is to craft a single LinkedIn post that captures the essence of the user's unique voice, tone, and style by analyzing the user's LinkedIn post text, not by directly reusing any of their previous posts. Additionally, incorporate relevant details from the post query to ensure the post is both topical and engaging.

      Instructions:
      1. Analyze the "User Profile Analysis" to extract the user's distinctive language, tone, and recurring stylistic quirks from their LinkedIn post text.
      2. Do not directly copy any existing post; instead, synthesize a new post that embodies the user's unique style.
      3. Seamlessly integrate key elements from the "Post Query" to ensure the post is contextually rich and aligns with the query's intent.
      4. Ensure the LinkedIn post is concise, engaging, and reflective of the user's personality while adhering to the platform's typical content guidelines.
      5. Do not include any extra text, labels, or commentary—output only the final post text.

      User Profile Analysis:
      ${userProfileAnalysis}

      Post Query:
      ${postQuery}

      Output: A single, original LinkedIn post that incorporates the provided query context with out any extra text or commentary like end of output etc.`
      } else {
        postPrompt = `System Prompt:
      You are an expert LinkedIn post generator with a deep understanding of professional social media language and stylistic nuance. Your objective is to craft a single LinkedIn post that perfectly mimics the user's unique voice, tone, and style as described in the provided user profile analysis. You will also integrate relevant details from additional context—such as insights from a current event or a YouTube video—to ensure the post is topical and engaging.

      Instructions:
      1. Use the "User Profile Analysis" to capture the user's distinctive language, tone, interests, and stylistic quirks.
      2. Incorporate key details from the "Additional Context" to make the post relevant and timely.
      3. Ensure the LinkedIn post is concise, engaging, and tailored to the user's personality.
      4. The post should adhere to LinkedIn's typical style and content guidelines.
      5. Do not include any extra text, labels, or commentary—output only the final post text.

      User Profile Analysis:
      ${userProfileAnalysis}

      Additional Context:
      ${additionalContext}

      Post Query:
      ${postQuery}

      Output: A single, original LinkedIn post that incorporates the given context with out any extra text or commentary like end of output etc..`
      }

      const generatedPost = await callIBMPostGeneration(postPrompt)
      setEditableContent(generatedPost)
      addTerminalLine("Post content generated successfully", "success")

      // Generate an image using the LinkedIn caption.
      addTerminalLine("Generating post image using caption...", "command")
      const imageResponse = await fetch(
        "https://api-lr.agent.ai/v1/agent/jzdtshn6u3sz625y/webhook/858144e2",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Tweet_text : generatedPost }),
        }
      )
      if (!imageResponse.ok) throw new Error("Image generation failed")
        const imageData = await imageResponse.json()
      addTerminalLine("Received image response", "success")
      
      // Get the HTML string from the response property
      const imageHtml = imageData.response
      
      // Extract the image URL using regex
      const srcMatch = imageHtml.match(/src="([^"]+)"/)
      if (srcMatch && srcMatch[1]) {
        setImageUrl(srcMatch[1])
        addTerminalLine("Image URL extracted successfully", "success")
      } else {
        addTerminalLine("Could not extract image URL from response", "error")
        addTerminalLine(`Raw response: ${JSON.stringify(imageData)}`, "info")
      }
  
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      addTerminalLine(`Error: ${errorMessage}`, "error")
    } finally {
      setIsLoading(false)
    }
  }
  
  // Save updated post content to the database.
// Save updated post content to the database using the provided schema.
const handleSave = async () => {
  if (!username || !editableContent) {
    addTerminalLine("Error: Missing required data to save", "error")
    return
  }
  try {
    addTerminalLine("Saving final post to database...", "command")
    const { error } = await supabase
      .from("social_media_posts")
      .insert([
        {
          platform: "linkedin", 
          username: username,
          content: editableContent,
          img_url: imageUrl,
          created_at: new Date().toISOString(),
        },
      ])
    if (error) throw error
    addTerminalLine("Final post saved successfully!", "success")
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    addTerminalLine(`Save failed: ${errorMessage}`, "error")
  }
}


  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(editableContent)
      addTerminalLine("Copied to clipboard", "success")
    } catch (error) {
      addTerminalLine("Failed to copy", "error")
    }
  }

  const downloadImage = () => {
    if (!imageUrl) return
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = `linkedin-post-${Date.now()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="h-screen flex bg-gray-900 font-mono overflow-hidden crt-effect">
      {/* Left Panel: Forms & Terminal */}
      <div className="w-1/2 flex flex-col border-r border-cyan-500/20">
        <div className="p-8 border-b border-cyan-500/20">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/choose-post-type" className="mr-2 hover:text-cyan-300 transition-colors">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-1 rounded-lg hover:bg-cyan-500/10">
                <ArrowLeft className="h-6 w-6 text-cyan-400" />
              </motion.div>
            </Link>
            <Linkedin className="text-cyan-400 h-8 w-8" />
            <h1 className="text-2xl font-bold text-cyan-600 glow-text">
              LINKEDIN POST GENERATOR
            </h1>
          </div>
          {/* Step 1: LinkedIn URL Input */}
          <form onSubmit={handleLinkedInSubmit}>
            <div className="flex gap-4">
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value)
                  // Clear previous user data.
                  setUsername("")
                  setProfileName("")
                  setProfilePicture("")
                  setProfileBio("")
                }}
                placeholder="Enter your LinkedIn URL"
                className="w-full px-4 py-3 bg-gray-800 rounded-lg border border-cyan-500/30 text-cyan-300 placeholder-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 pulse-border"
                disabled={accountFetched}
                required
              />
              <motion.button
                type="submit"
                disabled={isLoading || accountFetched}
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
                  {accountFetched && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -right-2 -top-2">
                      <CheckCircle className="h-5 w-5 text-cyan-500" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </form>
          {/* Step 2: Post Details Form */}
          <AnimatePresence>
            {showPostForm && (
              <motion.form
                onSubmit={handlePostSubmit}
                className="mt-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="space-y-4">
                  {/* Analysis Option Slider */}
                  <motion.div className="flex gap-2 mb-4" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
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
                  <div>
                    <label className="block text-sm text-cyan-400 mb-2">
                      Enter a URL for content inspiration (e.g., article, blog post, or YouTube video)
                    </label>
                    <input
                      type="url"
                      value={postUrl}
                      onChange={(e) => setPostUrl(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 rounded-lg border border-cyan-500/30 text-cyan-300 placeholder-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-cyan-400 mb-2">
                      What is the post about?
                    </label>
                    <textarea
                      value={postQuery}
                      onChange={(e) => setPostQuery(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 rounded-lg border border-cyan-500/30 text-cyan-300 placeholder-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 h-32"
                      required
                    />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-6 py-3 bg-cyan-500/10 text-cyan-300 rounded-lg border border-cyan-500/30 hover:bg-cyan-500/20"
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
        {/* Terminal Log */}
        <motion.div className="flex-1 bg-black/50 p-6 overflow-y-auto glow-terminal" animate={{ height: showPostForm ? "50%" : "100%" }} transition={{ duration: 0.5, ease: "easeInOut" }}>
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

      {/* Right Panel: Post Preview & Editing (Scrollable) */}
      <div className="w-1/2 bg-black/90 border-l border-blue-500/20 flex flex-col h-full">
        {/* Header */}
        <div className="p-8 flex-none">
          <div className="flex items-center gap-4">
            <div>
              {profilePicture ? (
                <img src={profilePicture} alt="Profile" className="h-10 w-10 rounded-full" />
              ) : (
                <Linkedin className="h-10 w-10 text-white" />
              )}
            </div>
            <div>
              <div className="font-bold text-white">
                {profileName || username || "username"}
              </div>
              <div className="text-blue-500/70 text-sm">
                {profileBio || "Professional Title"}
              </div>
            </div>
          </div>
        </div>
        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto p-8">
          <div className="bg-gray-900 rounded-xl border border-blue-500/20 p-4">
            {/* Post Header */}
            <div className="flex items-center gap-3 border-b border-blue-500/20 pb-4 mb-4">
              {profilePicture ? (
                <img src={profilePicture} alt="Profile" className="h-10 w-10 rounded-full" />
              ) : (
                <Linkedin className="h-10 w-10 text-white" />
              )}
              <div>
                <span className="text-white font-bold">
                  {profileName || username || "username"}
                </span>
                <div className="text-gray-400 text-xs">
                  {profileBio || "Professional Title"}
                </div>
              </div>
            </div>
            {/* Editable Post Content */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-blue-400 text-sm font-medium">Post Content</h3>
                <div className="flex gap-2">
                  <button onClick={copyToClipboard} className="px-3 py-1 bg-blue-500/10 text-blue-300 rounded border border-blue-500/30 hover:bg-blue-500/20 flex items-center gap-2">
                    <Copy size={16} /> Copy
                  </button>
                  <button onClick={() => setIsEditing(!isEditing)} className="px-3 py-1 bg-blue-500/10 text-blue-300 rounded border border-blue-500/30 hover:bg-blue-500/20 flex items-center gap-2">
                    <Edit3 size={16} /> Edit
                  </button>
                </div>
              </div>
              <div className="text-white whitespace-pre-wrap">
                {isEditing ? (
                  <textarea
                    value={editableContent}
                    onChange={(e) => setEditableContent(e.target.value)}
                    className="w-full h-48 bg-gray-800/50 text-white p-4 rounded border border-blue-500/30"
                    autoFocus
                    onBlur={() => setIsEditing(false)}
                  />
                ) : (
                  <ReactMarkdown className="prose-invert">
                    {editableContent || "// Generated post content will appear here"}
                  </ReactMarkdown>
                )}
              </div>
            </div>
            {/* Image Preview Section with Placeholder */}
            <div className="mt-6">
              {imageUrl ? (
                <motion.img
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  src={imageUrl}
                  className="w-full h-auto rounded-lg border border-blue-500/20"
                  alt="Generated Post Image"
                />
              ) : (
                <div className="aspect-video bg-gray-900/30 rounded-lg flex items-center justify-center text-blue-500/30 border-2 border-dashed border-blue-500/20">
                  <span>IMAGE PREVIEW</span>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={handleSave}
                disabled={!editableContent}
                className="px-4 py-2 bg-blue-500/10 text-blue-300 rounded border border-blue-500/30 hover:bg-blue-500/20 flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={18} />
                Save Post
              </button>
              <button
                onClick={handleLinkedInSubmit}
                className="px-4 py-2 bg-blue-500/10 text-blue-300 rounded border border-blue-500/30 hover:bg-blue-500/20 flex items-center gap-2"
              >
                <RefreshCw size={18} />
                Refresh Data
              </button>
            </div>
            <div className="flex justify-end mt-2">
              <button
                onClick={downloadImage}
                className="px-4 py-2 bg-blue-500/10 text-blue-300 rounded border border-blue-500/30 hover:bg-blue-500/20 flex items-center gap-2"
              >
                <Download size={18} />
                Download Image
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}