import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface DialogPortalProps {
  children: React.ReactNode
}

export function DialogPortal({ children }: DialogPortalProps) {
  if (typeof document === 'undefined') return null
  
  return createPortal(
    children,
    document.body
  )
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <DialogPortal>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full"
            >
              {children}
            </motion.div>
          </motion.div>
        </DialogPortal>
      )}
    </AnimatePresence>
  )
}

export function DialogContent({ children }: { children: React.ReactNode }) {
  return <div className="p-6">{children}</div>
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-semibold text-white">{children}</h2>
}

export function DialogDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-400 mt-2">{children}</p>
}