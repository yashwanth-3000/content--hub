"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@supabase/supabase-js'
import {
  Terminal,
  CheckCircle,
  Instagram,
  Copy,
  Download,
  Edit3,
  RefreshCw,
  ArrowLeft,
  Save
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type TerminalLineType = 'command' | 'success' | 'error' | 'info'

export default function InstagramPage() {
  const [username, setUsername] = useState('')
  const [url, setUrl] = useState('')
  const [urlQuery, setUrlQuery] = useState('')
  const [terminalLines, setTerminalLines] = useState<{ text: string; type: TerminalLineType }[]>([])
  const [visibleLines, setVisibleLines] = useState<{ text: string; type: TerminalLineType }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [usernameVerified, setUsernameVerified] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [instaCaption, setInstaCaption] = useState('')
  const [editableCaption, setEditableCaption] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const terminalEndRef = useRef<HTMLDivElement>(null)
  const typingSpeed = 2

  useEffect(() => {
    if (terminalLines.length > visibleLines.length) {
      const nextLine = terminalLines[visibleLines.length]
      setVisibleLines(prev => [...prev, nextLine])
    }
  }, [terminalLines, visibleLines.length])

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [visibleLines])

  const addTerminalLine = (text: string, type: TerminalLineType = 'info') => {
    setTerminalLines(prev => [...prev, { text, type }])
  }

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTerminalLines([])
    setVisibleLines([])
    setInstaCaption('')
    setImageUrl('')
    setEditableCaption('')

    try {
      addTerminalLine(`Checking database for Instagram account ${username}...`, 'command')
      const { data: existingUser, error: dbError } = await supabase
        .from('username')
        .select('content')
        .eq('username', username)
        .single()

      if (dbError && dbError.code !== 'PGRST116') throw dbError

      if (existingUser) {
        const content = JSON.parse(existingUser.content)
        addTerminalLine('Found existing account data', 'success')
        addTerminalLine(`${content.heading}\n${content.response}`, 'info')
        setUsernameVerified(true)
        setShowUrlInput(true)
        return
      }

      addTerminalLine('Analyzing Instagram account...', 'command')
      const usernameResponse = await fetch(
        'https://api-lr.agent.ai/v1/agent/sa3zhs11qxhjbd8t/webhook/8e25ef47',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ instagram_name: username }),
        }
      )
      if (!usernameResponse.ok) throw new Error('Instagram account analysis failed')
      const usernameData = await usernameResponse.json()

      addTerminalLine(`${usernameData.response.heading}\n${usernameData.response.response}`, 'info')

      addTerminalLine('Saving account information...', 'command')
      const { error: insertError } = await supabase
        .from('username')
        .insert([
          {
            username,
            content: JSON.stringify({
              heading: usernameData.response.heading,
              response: usernameData.response.response
            })
          }
        ])

      if (insertError) throw insertError

      addTerminalLine('Account data saved successfully', 'success')
      setUsernameVerified(true)
      setShowUrlInput(true)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addTerminalLine(`Error: ${errorMessage}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setInstaCaption('')
    setImageUrl('')

    try {
      addTerminalLine('Starting URL analysis...', 'command')
      const urlResponse = await fetch(
        'https://api-lr.agent.ai/v1/agent/9xgko4mdmqambne0/webhook/ac042486',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_URL: url,
            user_question: urlQuery
          })
        }
      )
      if (!urlResponse.ok) throw new Error('URL analysis failed')
      const urlData = await urlResponse.json()
      addTerminalLine(urlData.response.response, 'info')

      addTerminalLine('Generating Instagram caption...', 'command')
      const captionResponse = await fetch(
        'https://api-lr.agent.ai/v1/agent/98z7h166e066cn5k/webhook/777fe811',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_analysis: terminalLines.map(l => l.text).join('\n'),
            post_about: urlQuery
          })
        }
      )
      if (!captionResponse.ok) throw new Error('Caption generation failed')
      const captionData = await captionResponse.json()
      const generatedCaption = captionData.response.response

      setInstaCaption(generatedCaption)
      setEditableCaption(generatedCaption)
      addTerminalLine('Caption generated successfully', 'success')

      addTerminalLine('Generating post image...', 'command')
      const imageResponse = await fetch(
        'https://api-lr.agent.ai/v1/agent/jzdtshn6u3sz625y/webhook/858144e2',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ post_text: generatedCaption })
        }
      )
      if (!imageResponse.ok) throw new Error('Image generation failed')
      const imageData = await imageResponse.json()

      const imgTag = imageData.response.response
      const srcMatch = imgTag.match(/src="([^"]+)"/)
      if (srcMatch && srcMatch[1]) {
        setImageUrl(srcMatch[1])
        addTerminalLine('Image generated successfully', 'success')
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addTerminalLine(`Error: ${errorMessage}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegenerate = async () => {
    if (!usernameVerified) return
    await handleUrlSubmit(new Event('submit') as any)
  }

  const handleSave = async () => {
    if (!username || !editableCaption || !imageUrl) {
      addTerminalLine('Error: Missing required data to save', 'error')
      return
    }

    try {
      addTerminalLine('Saving post to database...', 'command')
      const { error } = await supabase
        .from('instagram_posts')
        .insert([
          {
            instagram_username: username,
            post_caption: editableCaption,
            img_url: imageUrl
          }
        ])

      if (error) throw error
      addTerminalLine('Post saved successfully!', 'success')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addTerminalLine(`Save failed: ${errorMessage}`, 'error')
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(editableCaption)
      addTerminalLine('Copied to clipboard', 'success')
    } catch (error) {
      addTerminalLine('Failed to copy', 'error')
    }
  }

  const downloadImage = () => {
    if (!imageUrl) return
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `insta-post-${Date.now()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="h-screen flex bg-gray-900 font-mono overflow-hidden crt-effect">
      {/* Left Panel (Website/LinkedIn Aesthetic) */}
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
            {/* Replaced LinkedIn icon with Instagram logo */}
            <Instagram className="text-cyan-400 h-8 w-8" />
            <h1 className="text-2xl font-bold text-cyan-600 glow-text">
              INSTAGRAM POST GENERATOR
            </h1>
          </div>

          <form onSubmit={handleUsernameSubmit}>
            <div className="flex gap-4">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Instagram username (without @)"
                className="w-full px-4 py-3 bg-gray-800 rounded-lg border border-cyan-500/30 text-cyan-300 placeholder-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 pulse-border"
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
                  'ANALYZE'
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
                  <div>
                    <label className="block text-sm text-cyan-500 mb-2">
                      Enter a URL for content inspiration (e.g., event page, article):
                    </label>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 rounded-lg border border-cyan-500/30 text-cyan-300 placeholder-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-cyan-500 mb-2">
                      What is the post about?
                    </label>
                    <textarea
                      value={urlQuery}
                      onChange={(e) => setUrlQuery(e.target.value)}
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
                    {isLoading ? 'PROCESSING...' : 'GENERATE CONTENT'}
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          className="flex-1 bg-black/50 p-6 overflow-y-auto glow-terminal"
          animate={{ height: showUrlInput ? '50%' : '100%' }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
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
                  line.type === 'command'
                    ? 'text-cyan-300'
                    : line.type === 'success'
                    ? 'text-green-400'
                    : line.type === 'error'
                    ? 'text-red-400'
                    : 'text-cyan-200'
                } terminal-line`}
              >
                {line.type === 'command' && <span className="text-cyan-500 mr-2">$</span>}
                <ReactMarkdown className="inline">{line.text}</ReactMarkdown>
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>
        </motion.div>
      </div>

      {/* Right Panel (Instagram Aesthetic with Image Preview Section) */}
      <div className="w-1/2 bg-black/90 border-l border-pink-500/20 p-8">
        <div className="h-full flex flex-col">
          <div className="flex items-center gap-4 mb-6">
            {/* Full Instagram logo */}
            <Instagram className="text-pink-600 h-10 w-10" />
            <div>
              <div className="font-bold text-white">{username || 'username'}</div>
              <div className="text-pink-500/70 text-sm">INSTAGRAM POST PREVIEW</div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl border border-pink-500/20 overflow-hidden">
            {/* Post Header */}
            <div className="flex items-center gap-3 p-4 border-b border-pink-500/20">
              <Instagram className="text-pink-600 h-10 w-10" />
              <div>
                <span className="text-white font-bold">{username || 'username'}</span>
                <div className="text-gray-400 text-xs">User Bio or Tagline</div>
              </div>
            </div>
            {/* Post Content */}
            <div className="p-4">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-pink-400 text-sm font-medium">Caption</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={copyToClipboard}
                      className="px-3 py-1 bg-pink-500/10 text-pink-300 rounded-lg border border-pink-500/30 hover:bg-pink-500/20 flex items-center gap-2"
                    >
                      <Copy size={16} /> Copy
                    </button>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="px-3 py-1 bg-pink-500/10 text-pink-300 rounded-lg border border-pink-500/30 hover:bg-pink-500/20 flex items-center gap-2"
                    >
                      <Edit3 size={16} /> Edit
                    </button>
                  </div>
                </div>
                <div className="text-white whitespace-pre-wrap">
                  {isEditing ? (
                    <textarea
                      value={editableCaption}
                      onChange={(e) => setEditableCaption(e.target.value)}
                      className="w-full h-48 bg-gray-800/50 text-white p-4 rounded-lg border border-pink-500/30"
                      autoFocus
                      onBlur={() => setIsEditing(false)}
                    />
                  ) : (
                    <ReactMarkdown className="prose-invert">
                      {editableCaption || '// Generated caption will appear here'}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
              {/* Image Preview Section */}
              <div className="relative group mb-6">
                {imageUrl ? (
                  <>
                    <motion.img
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      src={imageUrl}
                      className="w-full h-auto rounded-lg border border-pink-500/20"
                      alt="Generated post"
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        onClick={downloadImage}
                        className="p-2 bg-pink-500/10 text-pink-300 rounded-lg border border-pink-500/30 hover:bg-pink-500/20"
                      >
                        <Download size={20} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="aspect-video bg-gray-900/30 rounded-lg flex items-center justify-center text-pink-500/30 border-2 border-dashed border-pink-500/20">
                    <span>IMAGE PREVIEW</span>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleSave}
                  disabled={!editableCaption || !imageUrl}
                  className="px-4 py-2 bg-pink-500/10 text-pink-300 rounded-lg border border-pink-500/30 hover:bg-pink-500/20 flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={18} />
                  Save Post
                </button>
                <button
                  onClick={handleRegenerate}
                  className="px-4 py-2 bg-pink-500/10 text-pink-300 rounded-lg border border-pink-500/30 hover:bg-pink-500/20 flex items-center gap-2"
                >
                  <RefreshCw size={18} />
                  Regenerate Post
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
