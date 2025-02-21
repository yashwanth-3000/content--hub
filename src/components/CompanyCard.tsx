import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from './ui/Button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/Card'
import { CompanyCardProps } from '../types' 
import { MessageSquare } from 'lucide-react'
import Image, { StaticImageData } from 'next/image'  // Add Image back

const iconVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: { 
    scale: 1, 
    rotate: 0,
    transition: { 
      type: "spring",
      stiffness: 260,
      damping: 20,
      delay: 0.1
    }
  },
  hover: { 
    scale: 1.1,
    rotate: 5,
    transition: { 
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
}

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

const buttonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
}

// Let's use a simpler approach - keep using Next.js Image component but with unoptimized prop
export function CompanyCard({ company }: CompanyCardProps) {
  const companySlug = company.name.toLowerCase().replace(/\s+/g, '-')

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <Card className="bg-gray-800 border-gray-700 overflow-hidden h-[300px] flex flex-col">
        <div className="flex flex-col justify-center items-center flex-1 py-6">
          <motion.div 
            className="w-16 h-16 relative mb-4"
            variants={iconVariants}
          >
            <Image
              src={company.logoUrl}
              alt={`${company.name} logo`}
              width={64}
              height={64}
              className="rounded-full"
              unoptimized // This will bypass the domain check
              onError={(e) => {
                // @ts-ignore - typescript doesn't know about currentTarget.src
                e.currentTarget.src = ''
              }}
            />
            {company.icon && (
              <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-1">
                <company.icon size={16} className="text-white" />
              </div>
            )}
          </motion.div>
          <CardTitle className="text-center text-white mb-8">{company.name}</CardTitle>
          <Link href={`/chat/${companySlug}`} className="w-4/5">
            <motion.div
              variants={buttonVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              className="w-full"
            >
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300 flex items-center justify-center gap-2">
                <MessageSquare size={18} />
                Chat with AI
              </Button>
            </motion.div>
          </Link>
        </div>
      </Card>
    </motion.div>
  )
}