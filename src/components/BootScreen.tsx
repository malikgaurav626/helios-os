import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useAppStore } from '@/store/useAppStore'

const BOOT_SEQUENCE = [
  'INITIALIZING HELIOS_OS...',
  'MOUNTING NEURAL LINK: GAURAV MALIK',
  'AUTHORIZATION ACCEPTED.',
  'LOADING PROFILE DATA...',
  'EDUCATION: IIIT SONEPAT [B.TECH CSE]',
  'CURRENT ROLE: ASSOC. SOFTWARE ENG. @ MAQ SOFTWARE',
  'LOADING CAPABILITIES...',
  '>> C++, PYTHON, MERN, THREE.JS, WEB3',
  'SYSTEM READY.'
]

export function BootScreen() {
  const [lines, setLines] = useState<string[]>([])
  const setBooted = useAppStore(s => s.setBooted)

  useEffect(() => {
    let currentLine = 0
    const interval = setInterval(() => {
      if (currentLine < BOOT_SEQUENCE.length) {
        setLines(prev => [...prev, BOOT_SEQUENCE[currentLine]])
        currentLine++
      } else {
        clearInterval(interval)
        setTimeout(() => setBooted(true), 500)
      }
    }, 150)

    return () => clearInterval(interval)
  }, [setBooted])

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 flex flex-col justify-end p-8 bg-black text-white font-mono text-sm"
    >
      <div className="max-w-2xl w-full">
        <AnimatePresence>
          {lines.map((line, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-1"
            >
              {`> ${line}`}
            </motion.div>
          ))}
        </AnimatePresence>
        <motion.div 
          animate={{ opacity: [1, 0] }} 
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="inline-block w-2 h-4 bg-white mt-1"
        />
      </div>
    </motion.div>
  )
}
