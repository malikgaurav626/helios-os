import { useState, useEffect, useRef } from 'react'
import { motion, useAnimation } from 'motion/react'
import { useAppStore } from '@/store/useAppStore'

export function ThemeToggle() {
  const { theme, setTheme } = useAppStore()
  const btnControls = useAnimation()
  
  // Track if we are currently handling a toggle to prevent rapid clicks
  const isToggling = useRef(false)
  // Track if we are waiting for the theme to flip to trigger the return animation
  const isWaitingForFlip = useRef(false)

  // Start gentle breathing loop on mount
  useEffect(() => {
    if (!isToggling.current) {
      btnControls.start({
        scale: [1, 1.1, 1],
        transition: { repeat: Infinity, duration: 4, ease: "easeInOut" }
      })
    }
  }, [btnControls])

  // This perfectly synchronizes the "new circle" appearance with the exact frame React paints the new background
  useEffect(() => {
    if (isWaitingForFlip.current) {
      isWaitingForFlip.current = false
      
      // Instantly snap to 0 so there's no frame flash
      btnControls.set({ scale: 0 })
      
      // Expand from 0 to 1 immediately
      btnControls.start({
        scale: 1,
        transition: { duration: 0.6, ease: "easeOut" }
      }).then(() => {
        isToggling.current = false
        // Resume breathing
        btnControls.start({
          scale: [1, 1.1, 1],
          transition: { repeat: Infinity, duration: 4, ease: "easeInOut" }
        })
      })
    }
  }, [theme, btnControls])

  const toggleTheme = async () => {
    if (isToggling.current) return
    isToggling.current = true
    
    // 1. Expand to cover screen smoothly
    await btnControls.start({
      scale: 150,
      transition: { duration: 1.5, ease: "easeInOut" }
    })
    
    // 2. Trigger the flip. The useEffect will catch it and animate the new circle instantly.
    isWaitingForFlip.current = true
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center mix-blend-difference">
      {/* A single, highly performant hardware-accelerated circle */}
      <motion.button
        className="w-12 h-12 rounded-full bg-white pointer-events-auto focus:outline-none"
        animate={btnControls}
        onClick={toggleTheme}
      />
    </div>
  )
}
