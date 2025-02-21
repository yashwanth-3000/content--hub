import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return <div className={`bg-gray-800 border border-gray-700 rounded-lg overflow-hidden ${className}`}>{children}</div>
}

export function CardHeader({ children, className = '' }: CardProps) {
  return <div className={`p-4 ${className}`}>{children}</div>
}

export function CardContent({ children, className = '' }: CardProps) {
  return <div className={`p-4 ${className}`}>{children}</div>
}

export function CardFooter({ children, className = '' }: CardProps) {
  return <div className={`p-4 border-t border-gray-700 ${className}`}>{children}</div>
}

export function CardTitle({ children, className = '' }: CardProps) {
  return <h2 className={`text-lg font-semibold text-white ${className}`}>{children}</h2>
}

export function CardDescription({ children, className = '' }: CardProps) {
  return <p className={`text-sm text-gray-400 ${className}`}>{children}</p>
}