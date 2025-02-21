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

// Helper function to extract LinkedIn username from URL
const extractUsername = (url: string): string => {
  const regex = /linkedin\.com\/in\/([^/?]+)/i;
  const match = url.match(regex);
  return match ? match[1] : "";
}

// Helper to process the author info from a post.
const processAuthor = (
  author: any,
  addTerminalLine: (text: string, type?: TerminalLineType) => void,
  setProfileName: (name: string) => void,
  setProfilePicture: (pic: string) => void,
  setProfileBio: (bio: string) => void
) => {
  if (author) {
    let fullName = "";
    if (author.profile_type === "company") {
      // For company accounts, use the "name" (or "universal_name") and logo_url.
      fullName = author.name || author.universal_name || "";
      setProfilePicture(author.logo_url || "");
      addTerminalLine("Detected company account", "info");
    } else {
      // For personal accounts, use first_name & last_name if available.
      fullName =
        author.first_name && author.last_name
          ? `${author.first_name} ${author.last_name}`
          : author.profile_id || "";
      setProfilePicture(author.profile_picture || "");
      addTerminalLine("Detected personal account", "info");
    }
    setProfileName(fullName);
    setProfileBio(author.sub_title || "");
  } else {
    addTerminalLine("Detected nothing in the author field", "info");
  }
}

export default function LinkedInPage() {
  // Step 1: Get the LinkedIn URL from the user.
  const [inputUrl, setInputUrl] = useState("")
  // The extracted LinkedIn username from the API response.
  const [username, setUsername] = useState("")
  // Additional profile info extracted from the API.
  const [profileName, setProfileName] = useState("")
  const [profilePicture, setProfilePicture] = useState("")
  const [profileBio, setProfileBio] = useState("")
  // Flag indicating account analysis completion.
  const [accountFetched, setAccountFetched] = useState(false)
  // Step 2: Post details form.
  const [showPostForm, setShowPostForm] = useState(false)
  const [postUrl, setPostUrl] = useState("")
  const [postQuery, setPostQuery] = useState("")
  // Editable post caption.
  const [editableContent, setEditableContent] = useState("")
  // Optional image URL (will be saved but not shown in preview).
  const [imageUrl, setImageUrl] = useState("")
  // Terminal states.
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

  // Function to extract a valid (non-reposted) post.
  const getValidPost = (posts: any[]) => {
    return posts.find((post) => {
      // If header_text exists and includes "reposted" (case-insensitive), skip it.
      if (post.header_text && post.header_text.toLowerCase().includes("reposted")) {
        return false;
      }
      return true;
    });
  }

  // STEP 1: Analyze the LinkedIn account.
  const handleLinkedInSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Reset previous state.
    setTerminalLines([])
    setVisibleLines([])
    setEditableContent("")
    setImageUrl("")
    setUsername("")
    setProfileName("")
    setProfilePicture("")
    setProfileBio("")
    setAccountFetched(false)
    setShowPostForm(false)

    // First, try to extract the username from the input URL.
    const extractedUsername = extractUsername(inputUrl)
    if (!extractedUsername) {
      addTerminalLine("Step 1: Could not extract username from URL", "error")
      setIsLoading(false)
      return
    }
    addTerminalLine(`Step 1: Extracted username: ${extractedUsername}`, "info")

    // Check if record exists in Supabase.
    addTerminalLine("Step 2: Checking database for existing record...", "info")
    const { data: existingRecord, error: dbError } = await supabase
      .from("social_posts")
      .select("raw_content, content")
      .eq("platform", "linkedin")
      .eq("username", extractedUsername)
      .single()

    if (!dbError && existingRecord) {
      setUsername(extractedUsername)
      addTerminalLine("Step 3: Data loaded from database", "success")
      // Use the stored raw_content to extract profile info.
      const rawContent = existingRecord.raw_content
      addTerminalLine("Step 4: API Data from DB:", "info")
      addTerminalLine(JSON.stringify(rawContent, null, 2), "info")
      // Check if rawContent is wrapped under "response".
      const data = rawContent.response || rawContent
      const accountData = data[extractedUsername]
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
          if (validPost.attachments && validPost.attachments.length > 0) {
            const imageAttachment = validPost.attachments.find(
              (att: any) => att.att_type === "image"
            )
            if (
              imageAttachment &&
              imageAttachment.image_urls &&
              imageAttachment.image_urls.length > 0
            ) {
              setImageUrl(imageAttachment.image_urls[0])
            }
          }
        } else {
          addTerminalLine("No valid non-reposted post found in DB", "info")
        }
      } else {
        addTerminalLine("Detected nothing from DB posts", "info")
      }
      setAccountFetched(true)
      setShowPostForm(true)
      setIsLoading(false)
      return
    }

    // If not found in DB, then call the external API.
    addTerminalLine("Step 2: No record found in database. Calling external API...", "info")
    try {
      addTerminalLine(
        `Step 3: Analyzing LinkedIn account at URL: ${inputUrl}...`,
        "command"
      )
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

      // If the response is wrapped under "response", extract it.
      const data = responseData.response || responseData
      const keys = Object.keys(data)
      if (keys.length === 0)
        throw new Error("Empty response from LinkedIn API")
      const linkedInUsername = keys[0]
      const accountData = data[linkedInUsername]

      setUsername(linkedInUsername)
      addTerminalLine(
        `Step 4: Extracted LinkedIn username: ${linkedInUsername}`,
        "success"
      )

      // Extract profile info from the first valid (non-reposted) post.
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
          if (validPost.attachments && validPost.attachments.length > 0) {
            const imageAttachment = validPost.attachments.find(
              (att: any) => att.att_type === "image"
            )
            if (
              imageAttachment &&
              imageAttachment.image_urls &&
              imageAttachment.image_urls.length > 0
            ) {
              setImageUrl(imageAttachment.image_urls[0])
            }
          }
        } else {
          addTerminalLine("No valid non-reposted post found in API data", "info")
        }
      } else {
        addTerminalLine("Detected nothing from API posts", "info")
      }

      addTerminalLine("Step 5: API Data received:", "info")
      addTerminalLine(JSON.stringify(responseData, null, 2), "info")

      // Save the API data into Supabase.
      addTerminalLine("Step 6: Saving new LinkedIn account data...", "command")
      const { error: insertError } = await supabase
        .from("social_posts")
        .insert([
          {
            platform: "linkedin",
            username: linkedInUsername,
            raw_content: responseData,
            content: "", // Leave content empty for manual editing.
          },
        ])
      if (insertError) throw insertError
      addTerminalLine("Step 7: Account data saved successfully", "success")
      setAccountFetched(true)
      setShowPostForm(true)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      addTerminalLine(`Error: ${errorMessage}`, "error")
    } finally {
      setIsLoading(false)
    }
  }

  // STEP 2: Generate post content based on additional details.
  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setEditableContent("") // Clear previous content.

    try {
      addTerminalLine("Generating post content...", "command")
      // Simulated content generation.
      const generatedContent = `Generated LinkedIn Post:\n\nInspiration URL: ${postUrl}\n\nPost About: ${postQuery}\n\n(This is a simulated output based on your input.)`
      setEditableContent(generatedContent)
      addTerminalLine("Post content generated successfully", "success")
      if (!imageUrl) {
        addTerminalLine("Generating post image...", "command")
        setImageUrl("https://via.placeholder.com/800x400.png?text=LinkedIn+Post+Image")
        addTerminalLine("Image generated successfully", "success")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      addTerminalLine(`Error: ${errorMessage}`, "error")
    } finally {
      setIsLoading(false)
    }
  }

  // Save (update) the post content into the social_posts table.
  const handleSave = async () => {
    if (!username || !editableContent) {
      addTerminalLine("Error: Missing required data to save", "error")
      return
    }
    try {
      addTerminalLine("Saving updated post content to database...", "command")
      const { error } = await supabase
        .from("social_posts")
        .update({ content: editableContent })
        .eq("platform", "linkedin")
        .eq("username", username)
      if (error) throw error
      addTerminalLine("Post content updated successfully!", "success")
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

  // Note: The image preview section is removed as requested.
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
      {/* Left Panel: Header with Forms & Terminal */}
      <div className="w-1/2 flex flex-col border-r border-cyan-500/20">
        <div className="p-8 border-b border-cyan-500/20">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/choose-post-type" className="mr-2 hover:text-cyan-300 transition-colors">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1 rounded-lg hover:bg-cyan-500/10"
              >
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
                  // Clear previous user data when entering a new URL.
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
                  <div>
                    <label className="block text-sm text-cyan-400 mb-2">
                      Enter a URL for content inspiration (e.g., article, blog post)
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
        {/* Terminal: Appears immediately below the header forms */}
        <motion.div
          className="flex-1 bg-black/50 p-6 overflow-y-auto glow-terminal"
          animate={{ height: showPostForm ? "50%" : "100%" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <div className="flex items-center gap-2 mb-4 text-cyan-400">
            <Terminal className="h-5 w-5" />
            <span className="text-sm">ANALYSIS TERMINAL</span>
          </div>
          <div className="space-y-2 text-sm">
            {visibleLines.map((line, index) => (
              <div
                key={index}
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
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>
        </motion.div>
      </div>

      {/* Right Panel: Post Preview & Editing */}
      <div className="w-1/2 bg-black/90 border-l border-blue-500/20 p-8">
        <div className="h-full flex flex-col">
          <div className="flex items-center gap-4 mb-6">
            {/* Profile Image displayed as a circle without blue border */}
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
          <div className="bg-gray-900 rounded-xl border border-blue-500/20 overflow-hidden">
            {/* Post Header */}
            <div className="flex items-center gap-3 p-4 border-b border-blue-500/20">
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
            <div className="p-4">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-blue-400 text-sm font-medium">
                    Post Content
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={copyToClipboard}
                      className="px-3 py-1 bg-blue-500/10 text-blue-300 rounded border border-blue-500/30 hover:bg-blue-500/20 flex items-center gap-2"
                    >
                      <Copy size={16} /> Copy
                    </button>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="px-3 py-1 bg-blue-500/10 text-blue-300 rounded border border-blue-500/30 hover:bg-blue-500/20 flex items-center gap-2"
                    >
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
              {/* (Image preview section removed as requested) */}
              <div className="flex justify-end gap-2">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
