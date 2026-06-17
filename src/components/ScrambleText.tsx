import { useEffect, useState, useRef } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#%*<>'

interface ScrambleTextProps {
  text: string
  className?: string
  // If true, forces the scramble to empty spaces instead of the text
  scrambleToEmpty?: boolean 
  onComplete?: () => void
}

export function ScrambleText({ text, className, scrambleToEmpty = false, onComplete }: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text)
  const currentTextRef = useRef(text)
  const isFirstMount = useRef(true)

  useEffect(() => {
    // Skip animation on the very first mount, just display the text
    if (isFirstMount.current) {
      isFirstMount.current = false
      setDisplayText(scrambleToEmpty ? '' : text)
      currentTextRef.current = scrambleToEmpty ? '' : text
      return
    }

    const startText = currentTextRef.current
    const targetText = scrambleToEmpty ? '' : text
    
    if (targetText === startText) {
      return
    }

    let iteration = 0
    const maxLength = Math.max(startText.length, targetText.length)
    
    // We want the total animation to take around 2.0s
    // 40 iterations at 50ms = 2.0s
    const maxIterations = 40 
    
    const interval = setInterval(() => {
      setDisplayText((_) => {
        return Array.from({ length: maxLength }).map((_, index) => {
          const targetChar = targetText[index] || ''
          const isSpace = targetChar === ' ' || targetChar === '\n'
          
          // Reveal correct characters sequentially from left to right
          const progress = iteration / maxIterations
          const charProgressThreshold = index / maxLength
          
          if (progress >= charProgressThreshold) {
            return targetChar
          }
          
          // Still scrambling
          return isSpace && Math.random() > 0.5 ? ' ' : CHARS[Math.floor(Math.random() * CHARS.length)]
        }).join('')
      })

      if (iteration >= maxIterations) {
        clearInterval(interval)
        currentTextRef.current = targetText
        setDisplayText(targetText)
        if (onComplete) onComplete()
      }
      
      iteration += 1
    }, 50)

    return () => clearInterval(interval)
  }, [text, scrambleToEmpty, onComplete])

  return (
    <span className={className} style={{ whiteSpace: 'pre-wrap' }}>
      {displayText}
    </span>
  )
}
