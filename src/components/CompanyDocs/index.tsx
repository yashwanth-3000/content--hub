'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CompanyCard } from '@/components/CompanyCard'
import { AddCompanyCard } from '@/components/AddCompanyCard'
import { Search, Code, Database, Cloud, Shield, Brain, Bitcoin, Wifi, Glasses, Microscope, Leaf, AlertTriangle, LucideIcon } from 'lucide-react'

export interface Company {
  id: string
  name: string
  description: string
  logoUrl: string
  docsUrl: string
  icon: LucideIcon
}

export interface CompanyCardProps {
  company: Company
}

// Animation variants remain the same
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const searchVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
      delay: 0.2
    }
  },
  hover: {
    boxShadow: "0px 0px 8px rgba(59, 130, 246, 0.5)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
}

const headingVariants = {
  hidden: { opacity: 0, y: -50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
      delay: 0.2
    }
  }
}

const subheadingVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
      delay: 0.4
    }
  }
}

// Map industry keywords to icons
const getIconForCompany = (name: string): LucideIcon => {
  const nameLC = name.toLowerCase()
  if (nameLC.includes('tech')) return Code
  if (nameLC.includes('data')) return Database
  if (nameLC.includes('cloud')) return Cloud
  if (nameLC.includes('secure')) return Shield
  if (nameLC.includes('ai') || nameLC.includes('intelligence')) return Brain
  if (nameLC.includes('blockchain') || nameLC.includes('crypto')) return Bitcoin
  if (nameLC.includes('iot') || nameLC.includes('connect')) return Wifi
  if (nameLC.includes('vr') || nameLC.includes('reality')) return Glasses
  if (nameLC.includes('bio')) return Microscope
  if (nameLC.includes('eco')) return Leaf
  return AlertTriangle
}

function CompanyDocsGallery() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isWarningOpen, setIsWarningOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      // Call the updated API endpoint
      const response = await fetch('/api/test-neo4j');
      const data = await response.json();
  
      if (data.status === 'success' && data.companies) {
        // Transform Neo4j data to match Company interface
        const transformedCompanies: Company[] = data.companies.map((company: any) => ({
          id: company.id, // Use the unique element ID from Neo4j
          name: company.properties.name || 'Unknown Company',
          description: company.properties.description || 'No description available.',
          logoUrl: company.properties.logo_urls ? company.properties.logo_urls[1] : '', // Use the first logo URL
          docsUrl: `/docs/${(company.properties.name || 'unknown').toLowerCase()}`,
          icon: getIconForCompany(company.properties.name || ''),
        }));
  
        setCompanies(transformedCompanies);
        setFilteredCompanies(transformedCompanies);
        setIsLoading(false);
      } else {
        console.error('Failed to fetch companies: Invalid response structure');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setIsSearching(true)
      const filtered = companies.filter(company => 
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredCompanies(filtered)
      setIsSearching(false)
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, companies])
  

  const handleAddCompany = async (url: string) => {
    try {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })
      
      if (response.ok) {
        await fetchCompanies() // Refresh the companies list
      } else {
        setIsWarningOpen(true)
      }
    } catch (error) {
      console.error('Error adding company:', error)
      setIsWarningOpen(true)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-gray-100 flex items-center justify-center">
        <div className="w-8 h-8 border-t-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  const logoSvg = "/images/docs/documentaion.svg"
  return (
    <div className="min-h-screen bg-black text-gray-100">
      <div className="container mx-auto p-8">
        <motion.div
          className="mb-12 text-center"
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="mb-4"
            variants={headingVariants}
          >
          
            <br />
            <img 
              src={logoSvg} 
              alt="Company Logo" 
              className="mx-auto" 
              width="600" 
              height="120" 
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </motion.div>
          <motion.div
            className="text-lg text-gray-300 max-w-3xl mx-auto space-y-4"
            variants={subheadingVariants}
          >
            <p>
              Explore our curated collection of{' '}
              <a href="/companies" className="text-blue-400 hover:text-blue-300 underline transition-colors duration-200">
                10+ companies
              </a>
              {' '}and{' '}
              <a href="/companies" className="text-blue-400 hover:text-blue-300 underline transition-colors duration-200">
                100+ documentation URLs <br></br>
              </a>
              engage with AI-powered chatbots for in-depth information.
            </p>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="mb-12 max-w-md mx-auto relative"
          variants={searchVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
        >
          <input
            type="search"
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-12 bg-gray-800 text-white border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          {isSearching && (
            <motion.div 
              className="absolute right-4 top-1/2 transform -translate-y-1/2"
              initial={{ opacity: 0, rotate: 0 }}
              animate={{ opacity: 1, rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <div className="w-5 h-5 border-t-2 border-blue-500 rounded-full animate-spin"></div>
            </motion.div>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={searchTerm}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <AddCompanyCard/>
            {filteredCompanies.map((company: Company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default CompanyDocsGallery