import { useState, useEffect } from 'react'
import { motion, useAnimation, AnimatePresence } from 'motion/react'
import { OSDesktop } from '@/components/OSDesktop'
import { BootScreen } from '@/components/BootScreen'
import { useAppStore } from '@/store/useAppStore'

export function App() {
  const { isBooted, theme } = useAppStore()
  
  // Manage dynamic layers for the perfect clip-path theme transition
  const [layers, setLayers] = useState([{ id: Date.now(), theme }])
  const currentTheme = layers[layers.length - 1].theme

  const btnControls = useAnimation()

  // Start breathing animation on mount
  useEffect(() => {
    btnControls.start({
      scale: [1, 1.1, 1],
      transition: { repeat: Infinity, duration: 4, ease: "easeInOut" }
    })
  }, [btnControls])

  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light'
    
    // Spawn a new layer on top that will expand via clip-path
    setLayers(prev => [...prev, { id: Date.now(), theme: newTheme }])
    
    // The button simply continues its gentle breathing animation.
    // Because it has backdrop-invert, as the new layer expands underneath it,
    // the button will naturally invert the new background, creating a stunning
    // peeling effect without ever disappearing or shrinking!
  }

  const handleLayerComplete = (completedId: number) => {
    // When a layer finishes expanding, it completely covers the screen.
    // We can safely remove all layers underneath it to keep the DOM extremely fast.
    setLayers(prev => {
      const index = prev.findIndex(l => l.id === completedId)
      if (index > 0) {
        return prev.slice(index) // Keep this layer and any spawned after it
      }
      return prev
    })
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black selection:bg-[#ff3333] selection:text-white">
      
      {/* Theme Layers */}
      {isBooted && layers.map((layer, index) => {
        const isLight = layer.theme === 'light'
        const isFirst = index === 0
        
        return (
          <motion.div
            key={layer.id}
            className={`absolute inset-0 ${isLight ? 'bg-[#ffffff] text-[#000000]' : 'bg-[#000000] text-[#ffffff]'}`}
            initial={isFirst ? false : { clipPath: 'circle(0px at 50% 50%)' }}
            animate={{ clipPath: 'circle(2500px at 50% 50%)' }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
            onAnimationComplete={() => handleLayerComplete(layer.id)}
          >
            <OSDesktop theme={layer.theme} />
            
            {/* The Toggle Button is placed INSIDE the layer so mix-blend-difference can mathematically invert the text correctly */}
            <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
              <motion.button 
                className="w-12 h-12 rounded-full pointer-events-auto focus:outline-none backdrop-invert"
                animate={btnControls}
                onClick={toggleTheme}
              />
            </div>
          </motion.div>
        )
      })}

      {/* Global Overlays */}
      <div className="noise-overlay mix-blend-multiply opacity-20 pointer-events-none z-40"></div>

      {/* Boot Screen */}
      <AnimatePresence>
        {!isBooted && <BootScreen key="boot" />}
      </AnimatePresence>

    </div>
  )
}
