'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check } from 'lucide-react'

interface CopyButtonProps {
  text: string
}

export function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-1 rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </motion.div>
    </motion.button>
  )
}
