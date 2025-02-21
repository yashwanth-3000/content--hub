import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost'
  className?: string
}

export function Button({ children, variant = 'default', className = '', ...props }: ButtonProps) {
  const baseStyles = 'px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white'
  const variantStyles = {
    default: 'bg-blue-600 hover:bg-blue-700 text-white',
    ghost: 'text-gray-300 hover:bg-gray-700 hover:text-white'
  }

  return (
    <button className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

