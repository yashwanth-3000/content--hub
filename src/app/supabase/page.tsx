"use client"

import type React from "react"
import { useState } from "react"
import ReactMarkdown from "react-markdown"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface APIResponse {
  response: {
    format: string
    heading: string
    response: string
  }
}

interface DatabaseResponse {
  content: string
}

export default function TwitterAnalysisPage() {
  const [twitterName, setTwitterName] = useState("")
  const [result, setResult] = useState<APIResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)
    setError("")

    try {
      // Check if username exists in Supabase
      const { data: userData, error: userError } = await supabase
        .from('username')
        .select('content')
        .eq('username', twitterName)
        .order('created_at', { ascending: false })
        .limit(1)

      if (userError) throw userError

      if (userData && userData.length > 0) {
        const dbContent = JSON.parse(userData[0].content)
        setResult({
          response: {
            format: 'md',
            heading: dbContent.heading,
            response: dbContent.response
          }
        })
        setIsLoading(false)
        return
      }

      // If not found in DB, make API call
      const response = await fetch("https://api-lr.agent.ai/v1/agent/sa3zhs11qxhjbd8t/webhook/8e25ef47", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ twitter_name: twitterName }),
      })

      const data: APIResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.response?.response || "An error occurred while fetching data")
      }

      // Store result in Supabase
      const contentToStore = JSON.stringify({
        heading: data.response.heading,
        response: data.response.response
      })

      const { error: insertError } = await supabase
        .from('username')
        .insert([{ 
          username: twitterName,
          content: contentToStore
        }])

      if (insertError) console.error("Error saving to database:", insertError)

      setResult(data)
    } catch (error) {
      console.error("Error:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // The rest of the component remains the same
  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-4">Twitter Analysis</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="twitter-name" className="block text-sm font-medium text-gray-700">
              Twitter Username
            </label>
            <input
              id="twitter-name"
              type="text"
              value={twitterName}
              onChange={(e) => setTwitterName(e.target.value)}
              placeholder="Enter Twitter username (without @)"
              required
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? "Analyzing..." : "Analyze Twitter Profile"}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <h2 className="text-lg font-semibold mb-2">Error</h2>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">{result.response.heading}</h2>
            <div className="prose max-w-none">
              <ReactMarkdown>{result.response.response}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}