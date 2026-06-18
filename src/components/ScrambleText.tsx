import { useEffect, useState, useRef } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#%*<>'

interface ScrambleTextProps {
  text: string
  className?: string
  // If true, forces the scramble to empty spaces instead of the text
  scrambleToEmpty?: boolean 
  onComplete?: () => void
  animateOnMount?: boolean
}

export function ScrambleText({ text, className, scrambleToEmpty = false, animateOnMount = false, onComplete }: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(animateOnMount || scrambleToEmpty ? '' : text)
  const currentTextRef = useRef(animateOnMount || scrambleToEmpty ? '' : text)
  const isFirstMount = useRef(!animateOnMount)

  useEffect(() => {
    // Skip animation on the very first mount, unless animateOnMount is true
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
          const startChar = startText[index] || ''
          
          const progress = iteration / maxIterations
          const revealIndex = Math.floor(progress * maxLength)
          
          // Calculate window size so every char gets scrambled for at least a couple frames
          const charsPerFrame = Math.ceil(maxLength / maxIterations)
          const windowSize = Math.max(4, charsPerFrame * 2)
          
          if (index < revealIndex) {
            // Already revealed
            return targetChar
          } else if (index < revealIndex + windowSize) {
            // In the scrambling window
            // Preserve newlines to prevent layout jumping
            if (targetChar === '\n' || startChar === '\n') return '\n'
            
            const isSpace = targetChar === ' ' || startChar === ' '
            return isSpace && Math.random() > 0.5 ? ' ' : CHARS[Math.floor(Math.random() * CHARS.length)]
          } else {
            // Ahead of the scrambling window, keep the original text
            return startChar
          }
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
