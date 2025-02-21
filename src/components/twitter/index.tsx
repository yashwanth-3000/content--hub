'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Twitter, PenLine, MessageCircle, FileText, Terminal, Send, Save, X, Heart, Repeat2, BarChart2, Share } from 'lucide-react'
import { motion } from 'framer-motion'
import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
)

type TerminalLog = {
  message: string;
  timestamp: string;
  type: 'info' | 'process' | 'success' | 'error';
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#000000',
    color: 'white',
    fontFamily: 'Roboto, Arial, sans-serif',
    padding: '20px',
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '20px',
  },
  button: {
    backgroundColor: '#1DA1F2',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '24px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: '20px',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'background-color 0.2s',
  },
  textarea: {
    width: '100%',
    height: '100px',
    backgroundColor: '#262626',
    border: '1px solid #404040',
    borderRadius: '8px',
    color: '#e5e5e5',
    padding: '12px',
    fontSize: '14px',
    resize: 'none' as 'none',
  },
  terminalContainer: {
    backgroundColor: '#1a1b1e',
    borderRadius: '8px',
    border: '1px solid #2f3336',
    marginTop: '24px',
    overflow: 'hidden',
  },
  terminalHeader: {
    backgroundColor: '#2f3336',
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  terminalTitle: {
    color: '#e5e5e5',
    fontSize: '14px',
    fontWeight: '500',
  },
  terminalContent: {
    padding: '16px',
    maxHeight: '300px',
    overflowY: 'auto' as 'auto',
    fontFamily: 'monaco, Consolas, "Courier New", monospace',
    fontSize: '13px',
    lineHeight: '1.6',
  },
  logEntry: {
    marginBottom: '8px',
    display: 'flex',
    gap: '8px',
  },
  timestamp: {
    color: '#6b7280',
    minWidth: '85px',
  },
  message: (type: 'info' | 'process' | 'success' | 'error') => ({
    color: {
      info: '#e5e5e5',
      process: '#60a5fa',
      success: '#34d399',
      error: '#ef4444',
    }[type],
  }),
  saveDiscardContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '20px',
  },
  saveButton: {
    backgroundColor: '#1DA1F2',
    color: 'white',
    padding: '10px 16px',
    border: 'none',
    borderRadius: '18px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  discardButton: {
    backgroundColor: 'transparent',
    color: '#909090',
    padding: '10px 16px',
    border: '1px solid #909090',
    borderRadius: '18px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
}

const InputSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  isTyping: boolean;
}> = ({ title, icon, value, onChange, placeholder, isTyping }) => {
  const [displayedValue, setDisplayedValue] = useState('')

  useEffect(() => {
    if (isTyping) {
      let i = 0
      const interval = setInterval(() => {
        setDisplayedValue(value.slice(0, i))
        i++
        if (i > value.length) {
          clearInterval(interval)
        }
      }, 20)
      return () => clearInterval(interval)
    } else {
      setDisplayedValue(value)
    }
  }, [value, isTyping])

  return (
    <div style={{ marginBottom: '24px' }}>
      <label style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {icon}
        {title}
      </label>
      <textarea
        value={displayedValue}
        onChange={onChange}
        placeholder={placeholder}
        style={styles.textarea}
        readOnly={isTyping}
      />
    </div>
  )
}

const TwitterPreview: React.FC<{
  content: string;
  imageUrl: string;
  isLoading: boolean;
  isImageLoading: boolean;
  onContentChange: (newContent: string) => void;
  onSave: () => void;
  onDiscard: () => void;
  isTyping: boolean;
}> = ({ content, imageUrl, isLoading, isImageLoading, onContentChange, onSave, onDiscard, isTyping }) => {
  const [interactions, setInteractions] = useState({
    quoted: false,
    reposted: false,
    liked: false,
    viewed: false,
    stats: {
      quotes: 93,
      reposts: 190,
      likes: 939,
      views: 63000
    }
  });
  const [username, setUsername] = useState("Twitter User");
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [editingContent, setEditingContent] = useState(content);
  const [displayedContent, setDisplayedContent] = useState('');

  useEffect(() => {
    if (isTyping) {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayedContent(content.slice(0, i));
        i++;
        if (i > content.length) {
          clearInterval(interval);
        }
      }, 20);
      return () => clearInterval(interval);
    } else {
      setDisplayedContent(content);
    }
  }, [content, isTyping]);

  const handleInteraction = (type: 'quote' | 'repost' | 'like' | 'view' | 'share') => {
    setInteractions(prev => ({
      ...prev,
      [type === 'quote' ? 'quoted' : type]: !prev[type === 'quote' ? 'quoted' : type as keyof typeof prev],
      stats: {
        ...prev.stats,
        [type + 's']: prev[type === 'quote' ? 'quoted' : type as keyof typeof prev] ?
          prev.stats[type + 's' as keyof typeof prev.stats] - 1 :
          prev.stats[type + 's' as keyof typeof prev.stats] + 1
      }
    }))
  }

  const handleUsernameChange = (newUsername: string) => {
    setUsername(newUsername);
    setIsEditingUsername(false);
  };

  const handleSaveContent = () => {
    onContentChange(editingContent);
    setIsEditingCaption(false);
  };

  const styles = {
    container: {
      backgroundColor: '#000000',
      borderRadius: '12px',
      overflow: 'hidden',
      color: '#e5e5e5',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      opacity: isLoading ? 0.7 : 1,
      transition: 'opacity 0.2s',
      border: '1px solid #333333'
    },
    header: {
      padding: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    avatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      overflow: 'hidden',
      backgroundColor: '#1DA1F2',
      border: '1px solid #2f3336',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    content: {
      padding: '0 16px',
      fontSize: '14px',
      lineHeight: '1.5',
      whiteSpace: 'pre-wrap' as const
    },
    image: {
      padding: '12px',
      position: 'relative' as const,
    },
    imageStyle: {
      width: '100%',
      borderRadius: '16px',
      border: '1px solid #333333'
    },
    imageOverlay: {
      position: 'absolute' as const,
      top: '16px',
      left: '16px',
      right: '16px',
      bottom: '16px',
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '16px'
    },
    stats: {
      padding: '8px 12px',
      display: 'flex',
      gap: '24px',
      color: '#71767b',
      fontSize: '12px',
      borderBottom: '1px solid #333333'
    },
    actions: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '4px 12px'
    },
    actionButton: (isActive: boolean, color: string) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: isActive ? color : '#71767b',
      padding: '8px',
      borderRadius: '50%',
      cursor: 'pointer',
      backgroundColor: 'transparent',
      border: 'none',
      transition: 'all 0.2s'
    })
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.avatar}>
          <Twitter size={24} color="#FFFFFF" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {isEditingUsername ? (
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => handleUsernameChange(username)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid #1d9bf0',
                  color: '#e5e5e5',
                  fontSize: '14px',
                  fontWeight: '700',
                  padding: '2px',
                }}
                autoFocus
              />
            ) : (
              <span style={{ fontWeight: '700', cursor: 'pointer' }} onClick={() => setIsEditingUsername(true)}>
                {username}
              </span>
            )}
            <span style={{ color: '#1d9bf0' }}>✓</span>
          </div>
          <span style={{ color: '#71767b' }}>@{username.toLowerCase().replace(/\s+/g, '')}</span>
        </div>
      </div>

      <div style={styles.content} onClick={() => setIsEditingCaption(true)}>
        {isEditingCaption ? (
          <div>
            <textarea
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: '#e5e5e5',
                fontSize: '15px',
                lineHeight: '1.5',
                resize: 'none',
              }}
              autoFocus
            />
            <button
              onClick={handleSaveContent}
              style={{
                backgroundColor: '#1d9bf0',
                color: 'white',
                border: 'none',
                borderRadius: '9999px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '8px',
              }}
            >
              Save
            </button>
          </div>
        ) : (
          isLoading ? 'Generating tweet...' : displayedContent
        )}
      </div>

      <div style={styles.image}>
        <Image src={imageUrl} alt="Post content" width={400} height={400} style={styles.imageStyle} />
        {isImageLoading && (
          <div style={styles.imageOverlay}>
            Generating image...
          </div>
        )}
      </div>

      <div style={styles.stats}>
        <span><strong>{interactions.stats.quotes}</strong> Quotes</span>
        <span><strong>{interactions.stats.reposts}</strong> Reposts</span>
        <span><strong>{interactions.stats.likes}</strong> Likes</span>
        <span><strong>{(interactions.stats.views / 1000).toFixed(1)}K</strong> Views</span>
      </div>

      <div style={styles.actions}>
        {[
          { type: 'quote', icon: MessageCircle, color: '#1d9bf0' },
          { type: 'repost', icon: Repeat2, color: '#00ba7c' },
          { type: 'like', icon: Heart, color: '#f91880' },
          { type: 'view', icon: BarChart2, color: '#1d9bf0' },
          { type: 'share', icon: Share, color: '#1d9bf0' }
        ].map(({ type, icon: Icon, color }) => (
          <button
            key={type}
            style={styles.actionButton(interactions[type === 'quote' ? 'quoted' : type as keyof typeof interactions] as boolean, color)}
            onClick={() => handleInteraction(type as "quote" | "repost" | "like" | "view" | "share")}
          >
            <Icon
              size={20}
              color={interactions[type === 'quote' ? 'quoted' : type as keyof typeof interactions] ? color : '#71767b'}
            />
          </button>
        ))}
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '16px',
        padding: '0 16px 16px'
      }}>
        <button
          onClick={onSave}
          style={{
            backgroundColor: '#1d9bf0',
            color: 'white',
            border: 'none',
            borderRadius: '9999px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Save
        </button>
        <button
          onClick={onDiscard}
          style={{
            backgroundColor: '#000000',
            color: '#ff4444',
            border: '1px solid #ff4444',
            borderRadius: '9999px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Discard
        </button>
      </div>
    </div>
  )
}

const TerminalWindow: React.FC<{
  terminalRef: React.RefObject<HTMLDivElement>;
  terminalLogs: TerminalLog[];
}> = ({ terminalRef, terminalLogs }) => {
  return (
    <div style={styles.terminalContainer}>
      <div style={styles.terminalHeader}>
        <Terminal size={16} color="#e5e5e5" />
        <span style={styles.terminalTitle}>Terminal Output</span>
      </div>
      <div style={styles.terminalContent} ref={terminalRef}>
        {terminalLogs.map((log, index) => (
          <div key={index} style={styles.logEntry}>
            <span style={styles.timestamp}>[{log.timestamp}]</span>
            <span style={styles.message(log.type)}>{log.message}</span>
          </div>
        ))}
        {terminalLogs.length === 0 && (
          <div style={{ color: '#6b7280' }}>Waiting for generation process to start...</div>
        )}
      </div>
    </div>
  )
}

export default function Component() {
  const [userPrompt, setUserPrompt] = useState("")
  const [generatedContent, setGeneratedContent] = useState("")
  const [generatedImage, setGeneratedImage] = useState("https://i.imgur.com/4Z3mGfU.jpeg")
  const [isLoading, setIsLoading] = useState(false)
  const [isImageLoading, setIsImageLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([])
  const terminalRef = useRef<HTMLDivElement | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [terminalLogs])

  const addLog = (message: string, type: 'info' | 'process' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setTerminalLogs(prev => [...prev, { message, timestamp, type }])
  }

  const generateImage = async (imageDescription: string) => {
    try {
      addLog('Starting image generation...', 'process')
      const imageResponse = await fetch('http://3.129.88.226:5000/generate_image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: imageDescription }),
      })

      if (!imageResponse.ok) {
        throw new Error(`HTTP error! status: ${imageResponse.status}`)
      }

      const imageResult = await imageResponse.json()
      addLog('Image generated successfully ✓', 'success')
      setGeneratedImage(imageResult.image_url)
    } catch (error) {
      addLog('Image generation failed', 'error')
      setError('Image generation failed')
    } finally {
      setIsImageLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (userPrompt.trim()) {
      setIsLoading(true);
      setIsImageLoading(true);
      setError(null);
      setTerminalLogs([]);
      setIsTyping(false);
      
      try {
        addLog('Initializing generation process...', 'process');
        
        // Call the Twitter content generation API
        const twitterResponse = await fetch('http://3.129.88.226:5000/twitter', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ input_text: userPrompt }),
        });

        if (!twitterResponse.ok) {
          throw new Error(`HTTP error! status: ${twitterResponse.status}`)
        }

        const twitterResult = await twitterResponse.json();
        console.log('Twitter API response:', twitterResult);

        if (twitterResult.error) {
          throw new Error(twitterResult.error)
        }

        setGeneratedContent(twitterResult.tweet_text || "What's happening?");
        setIsLoading(false);
        setIsTyping(true);
        addLog('Tweet content generated successfully ✓', 'success');

        // Generate image using the image description
        if (twitterResult.image_description) {
          await generateImage(twitterResult.image_description);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          addLog(`Error: ${error.message}`, 'error')
          setError(error.message)
        } else {
          addLog('An unknown error occurred', 'error')
          setError('An unknown error occurred')
        }
        setGeneratedContent("What's happening?")
        setGeneratedImage("/placeholder.svg?height=400&width=400")
        setIsLoading(false)
        setIsImageLoading(false)
        setIsTyping(false)
      }
    }
  }

  const handleContentChange = (newContent: string) => {
    setGeneratedContent(newContent);
  };

  const handleSave = () => {
    setShowDialog(true)
  }

  const handleConfirmSave = async () => {
    setIsSaving(true)
    addLog('Saving content to Supabase...', 'process')

    try {
      const { data, error } = await supabase
        .from('content_gallery')
        .insert([
          {
            platform: 'Twitter',
            caption: generatedContent,
            url: generatedImage,
            user_name: 'Twitter User',
          },
        ])

      if (error) {
        throw error
      }

      addLog('Content saved successfully', 'success')
      setShowDialog(false)
    } catch (error: any) {
      addLog(`Error saving content: ${error.message}`, 'error')
      setError(`Error saving content: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelSave = () => {
    setShowDialog(false)
  }

  const handleDiscard = () => {
    setGeneratedContent("What's happening?");
    setGeneratedImage('/placeholder.svg?height=400&width=400');
    setIsTyping(false);
  };

  return (
    <div style={styles.container}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={styles.titleContainer}>
          <Twitter size={32} color="#1DA1F2" />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e5e5e5' }}>
            Twitter Post Generator
          </h1>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '40px', justifyContent: 'center' }}>
          <div>
            <InputSection
              title="Your Prompt"
              icon={<PenLine size={20} color="#1DA1F2" />}
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Enter your tweet content..."
              isTyping={false}
            />
            
            <InputSection
              title="Generated Content (click to edit)"
              icon={<FileText size={20} color="#1DA1F2" />}
              value={generatedContent}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Your generated tweet will appear here..."
              isTyping={isTyping}
            />

            <motion.button 
              onClick={handleGenerate} 
              style={{
                ...styles.button,
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLoading ? 'Generating...' : 'Generate Tweet'}
              <Send size={18} style={{ marginLeft: '8px' }} />
            </motion.button>

            <TerminalWindow terminalRef={terminalRef} terminalLogs={terminalLogs} />
          </div>

          <div>
            <div style={{ position: 'sticky', top: '20px' }}>
              <TwitterPreview 
                content={generatedContent} 
                imageUrl={generatedImage}
                isLoading={isLoading}
                isImageLoading={isImageLoading}
                onContentChange={handleContentChange}
                onSave={handleSave}
                onDiscard={handleDiscard}
                isTyping={isTyping}
              />
            </div>
          </div>
        </div>
      </div>

      {showDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: '#262626',
            padding: '24px',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '100%',
          }}>
            <h2 style={{ color: '#e5e5e5', marginBottom: '16px' }}>Save to Gallery</h2>
            <p style={{ color: '#a0a0a0', marginBottom: '24px' }}>Are you sure you want to save this post to the gallery?</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <motion.button
                onClick={handleCancelSave}
                style={{
                  ...styles.discardButton,
                  padding: '8px 16px',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isSaving}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleConfirmSave}
                style={{
                  ...styles.saveButton,
                  padding: '8px 16px',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Confirm'}
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}