import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/Card'

import { Plus, Github, ExternalLink, Code2, Server } from 'lucide-react'

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: "spring",
      stiffness: 100,
      damping: 10,
      delay: 0.2
    }
  },
  hover: { 
    y: -10,
    boxShadow: "0px 10px 20px rgba(0,0,0,0.4)",
    transition: { 
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
}

const iconVariants = {
  hidden: { scale: 0, rotate: 0 },
  visible: { 
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 10
    }
  },
  hover: {
    scale: 1.2,
    rotate: 90,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 8
    }
  }
}

export function AddCompanyCard() {
  const githubRepoUrl = "https://github.com/yashwanth-3000/Dev-Docs-Local" // Replace with actual repo URL

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <Card className="h-[300px] flex flex-col justify-center items-center cursor-pointer relative overflow-hidden">
        <a 
          href={githubRepoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-full"
        >
          <CardHeader className="pb-0">
            <CardTitle className="text-center text-2xl font-bold">Add Your Company</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-8 relative">
            {/* Central Plus Icon */}
            <motion.div
              variants={iconVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              className="relative z-10"
            >
              <Plus className="h-28 w-28 text-blue-500 hover:text-blue-600 transition-colors" />
            </motion.div>

            {/* Description Text */}
            <motion.p 
              className="text-center text-lg text-gray-600 max-w-[80%] relative z-10 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Get started by installing locally from our GitHub repository
            </motion.p>

            {/* Background decoration */}
            <motion.div 
              className="absolute w-full h-full opacity-10"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl" />
            </motion.div>
          </CardContent>
        </a>
      </Card>
    </motion.div>
  )
}