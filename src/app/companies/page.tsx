'use client'

import { motion } from 'framer-motion'
import { ExternalLink, Search } from 'lucide-react'
import { useState } from 'react'

// Sample data for 20 companies and their documentation URLs
const companiesData = [
  {
    name: 'Hypermode',
    docs: [
      'https://docs.hypermode.com/introduction',
      'https://docs.hypermode.com/quickstart',
      'https://docs.hypermode.com/work-locally',
      'https://docs.hypermode.com/deploy',
      'https://docs.hypermode.com/configure-environment',
      'https://docs.hypermode.com/integrate-api',
      'https://docs.hypermode.com/create-project',
      'https://docs.hypermode.com/modify-project',
      'https://docs.hypermode.com/hosted-models',
      'https://docs.hypermode.com/hyp-cli',
    ]
  },
  {
    name: 'Hypermode(Modus)',
    docs: [
      'https://docs.hypermode.com/modus/overview',
      'https://docs.hypermode.com/modus/quickstart',
      'https://docs.hypermode.com/modus/app-manifest',
      'https://docs.hypermode.com/modus/data-fetching',
      'https://docs.hypermode.com/modus/model-invoking',
      'https://docs.hypermode.com/modus/search',
      'https://docs.hypermode.com/modus/api-generation',
      'https://docs.hypermode.com/modus/authentication',
      'https://docs.hypermode.com/modus/sdk/neo4j'

    ]
  },
  {
    name: 'Elevenlabs',
    docs: [
      'https://elevenlabs.io/docs/product/introduction',
      'https://elevenlabs.io/docs/product/speech-synthesis/overview',
      'https://elevenlabs.io/docs/product/speech-synthesis/voice-selection',
      'https://elevenlabs.io/docs/product/speech-synthesis/voice-settings',
      'https://elevenlabs.io/docs/product/speech-synthesis/models',
      'https://elevenlabs.io/docs/product/speech-synthesis/prompting',
      'https://elevenlabs.io/docs/product/speech-synthesis/speech-to-speech',
      'https://elevenlabs.io/docs/product/sound-effects/overview',

    ]
  },
  {
    name: 'Anthropic',
    docs: [
      'https://docs.anthropic.com/en/api/messages',
      'https://docs.anthropic.com/en/api/messages-count-tokens',
      'https://docs.anthropic.com/en/api/messages-streaming',
      'https://docs.anthropic.com/en/api/migrating-from-text-completions-to-messages',
      'https://docs.anthropic.com/en/api/messages-examples',
      'https://docs.anthropic.com/en/api/models-list',
      'https://docs.anthropic.com/en/api/models',
      'https://docs.anthropic.com/en/api/complete',
    ]
  },
  {
    name: 'Crew.ai',
    docs: [
      'https://docs.crewai.com/introduction',
      'https://docs.crewai.com/installation',
      'https://docs.crewai.com/quickstart',
      'https://docs.crewai.com/concepts/agents',
      'https://docs.crewai.com/concepts/tasks',
      'https://docs.crewai.com/concepts/crews',
      'https://docs.crewai.com/concepts/flows',
      'https://docs.crewai.com/concepts/processes',
    ]
  },
  {
    name: 'together.ai',
    docs: [
      'https://docs.together.ai/docs/introduction',
      'https://docs.together.ai/docs/quickstart',
      'https://docs.together.ai/docs/openai-api-compatibility',
      'https://docs.together.ai/docs/chat-overview',
      'https://docs.together.ai/docs/json-mode',
      'https://docs.together.ai/docs/function-calling',
      'https://docs.together.ai/docs/llama-3-function-calling',
      'https://docs.together.ai/docs/logprobs',
      'https://docs.together.ai/docs/integrations',
    ]
  },
  {
    name: 'Neo4j',
    docs: [
      'https://neo4j.com/docs/getting-started/whats-neo4j/',
      'https://neo4j.com/docs/getting-started/graph-database/',
      'https://neo4j.com/docs/getting-started/appendix/graphdb-concepts/',
      'https://neo4j.com/docs/getting-started/appendix/graphdb-concepts/graphdb-vs-rdbms/',
      'https://neo4j.com/docs/getting-started/appendix/graphdb-concepts/graphdb-vs-nosql/',
      'https://neo4j.com/docs/getting-started/cypher/',
      'https://neo4j.com/docs/getting-started/cypher-intro/cypher-sql/',
      'https://neo4j.com/docs/getting-started/cypher-intro/patterns/',
      'https://neo4j.com/docs/getting-started/cypher-intro/patterns-in-practice/',
      'https://neo4j.com/docs/getting-started/cypher-intro/subqueries/',
      'https://neo4j.com/docs/getting-started/cypher-intro/schema/',
    ]
  },
  {
    name: 'Fastapi',
    docs: [
      'https://fastapi.tiangolo.com/',
    ]
  },
  
]

const CompanySection = ({ company, index }: { company: typeof companiesData[0], index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="mb-8 text-center"
    >
      <motion.h2 
        className="text-3xl font-bold text-white mb-4"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ delay: index * 0.05 + 0.1 }}
      >
        {company.name}
      </motion.h2>
      <ul className="space-y-1">
        {company.docs.map((url, idx) => (
          <motion.li
            key={idx}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 + idx * 0.02 + 0.2 }}
            className="text-base text-gray-300 hover:text-white transition-colors mb-2"
          >
            <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
              <span className="mr-1 text-gray-500">{idx + 1}.</span>
              <ExternalLink className="mr-1 h-3 w-3" />
              {url.split('//')[1]}
            </a>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  )
}

export default function Page() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCompanies = companiesData.filter(company => 
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.docs.some(doc => doc.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <br></br>
          <br></br>
          <br></br>

          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search companies or documentation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-900 text-white border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <br></br>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {filteredCompanies.map((company, index) => (
            <CompanySection key={index} company={company} index={index} />
          ))}
        </div>
      </div>
    </div>
  )
}

