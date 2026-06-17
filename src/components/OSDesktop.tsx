import { motion } from 'motion/react'
import { useState, useEffect } from 'react'
import { PROJECTS } from '@/projects/registry'
import { useAppStore } from '@/store/useAppStore'
import { ScrambleText } from './ScrambleText'

const CIRCLE_PRESETS = [
  { c1: { cx: '20%', cy: '40%', r: '40%' }, c2: { cx: '30%', cy: '50%', r: '60%' } },
  { c1: { cx: '80%', cy: '10%', r: '50%' }, c2: { cx: '70%', cy: '80%', r: '45%' } },
  { c1: { cx: '50%', cy: '50%', r: '75%' }, c2: { cx: '10%', cy: '90%', r: '30%' } },
  { c1: { cx: '-10%', cy: '50%', r: '80%' }, c2: { cx: '110%', cy: '50%', r: '80%' } },
]

export function OSDesktop({ theme }: { theme?: 'light' | 'dark' }) {
  const { enterProject, activeProjectId } = useAppStore()
  const [presetIdx, setPresetIdx] = useState(0)

  useEffect(() => {
    // Whenever we enter or exit a project, shift the background circles
    setPresetIdx(prev => (prev + 1) % CIRCLE_PRESETS.length)
  }, [activeProjectId])

  const preset = CIRCLE_PRESETS[presetIdx]
  const isProject = !!activeProjectId
  const activeProject = PROJECTS.find(p => p.id === activeProjectId)

  const titleText = isProject ? activeProject?.title || '' : 'GARDEN\nEDEN 26'
  const descText = isProject ? activeProject?.description || '' : 'WHEN THE WAR OF THE BEASTS BRINGS ABOUT THE WORLD\'S END, THE GODDESS DESCENDS FROM THE SKY. WINGS OF LIGHT AND DARK SPREAD AFAR. SHE GUIDES US TO BLISS, HER GIFT EVERLASTING.'
  const metaText = isProject 
    ? `Project: ${activeProject?.id}\nStatus: Retrieved\nAuth: Cleared` 
    : `Location: Sector 03\nDate: 18/06/2026\nStatus: Active`

  return (
    <div className="relative w-full h-full overflow-hidden font-sans pointer-events-auto selection:bg-[#ff3333] selection:text-white">
      
      {/* Background Technical Linework */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <motion.circle 
            animate={preset.c1} 
            transition={{ duration: 2, ease: "easeInOut" }}
            fill="none" stroke="currentColor" strokeWidth="1" 
          />
          <motion.circle 
            animate={preset.c2} 
            transition={{ duration: 2.5, ease: "easeInOut" }}
            fill="none" stroke="currentColor" strokeWidth="1" 
          />
          <line x1="0" y1="30%" x2="100%" y2="30%" stroke="currentColor" strokeWidth="1" />
          <line x1="45%" y1="0" x2="45%" y2="100%" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative z-10 p-4 md:p-12 w-full h-full flex flex-col"
      >
        {/* Top Header */}
        <header className="flex justify-between items-start border-b border-current pb-4 mb-16">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 border-2 border-current flex items-center justify-center p-1">
              <motion.div 
                className="w-full h-full border-current"
                animate={{
                  scale: [0.707, 0.4, 0.4, 0.707],
                  rotate: [45, 45, 45 + 1080, 45 + 1080],
                  borderWidth: [1, 6, 6, 1]
                }}
                transition={{
                  duration: 4,
                  times: [0, 0.15, 0.85, 1],
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 1.5
                }}
              />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-widest mb-1">HELIOS_OS</h1>
              <p className="text-xs font-mono opacity-50 uppercase tracking-widest">VER 4.8 // RECORD-TRI</p>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <div className="text-right font-mono text-xs uppercase tracking-widest opacity-50 mb-2 leading-relaxed whitespace-pre-line">
              <ScrambleText text={metaText} />
            </div>
            {/* Barcode artifact */}
            <div className="flex items-center h-4 gap-1 border border-current p-1 opacity-50">
              <div className="w-1 h-full bg-current" />
              <div className="w-2 h-full bg-current" />
              <div className="w-1 h-full bg-current" />
              <div className="w-3 h-full bg-current" />
              <div className="w-1 h-full bg-current" />
              <div className="w-8 h-full" />
            </div>
          </div>
        </header>

        {/* Main Content Grid */}
        <main className="flex-1 grid grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Huge Brutalist Text */}
          <div className="col-span-12 md:col-span-5 flex flex-col">
            <div className="relative inline-block mb-4">
               <motion.span 
                 className="absolute -left-6 top-2 text-[#ff3333] text-sm"
                 animate={{ opacity: [1, 0, 1] }}
                 transition={{ repeat: Infinity, duration: 1.5, ease: "steps(2)" }}
               >
                 ■
               </motion.span>
               <h2 className="text-7xl lg:text-9xl font-black uppercase tracking-tighter leading-[0.85] whitespace-pre-line">
                 <ScrambleText text={titleText} />
               </h2>
            </div>

            <div className="mt-8 pl-4 border-l-2 border-current max-w-md">
              <p className="text-xs font-mono uppercase tracking-widest opacity-60 leading-relaxed whitespace-pre-line">
                <ScrambleText text={descText} />
              </p>
            </div>
          </div>

          {/* Right Column: Project Registry */}
          <div className="col-span-12 md:col-span-7 flex flex-col justify-end">
            <div className="border-b border-current mb-4 pb-2 text-xs font-mono uppercase tracking-widest flex justify-between">
              <ScrambleText text="Artifact ID" scrambleToEmpty={isProject} />
              <ScrambleText text="Designation" scrambleToEmpty={isProject} />
              <ScrambleText text="Status" scrambleToEmpty={isProject} />
            </div>

            <div className="flex flex-col">
              {PROJECTS.map((project) => (
                <motion.div 
                  key={project.id}
                  whileHover={!isProject ? { x: 10 } : {}}
                  onClick={() => !isProject && enterProject(project.id)}
                  className={`group relative flex flex-col md:flex-row justify-between items-start md:items-center border-b border-current py-4 ${isProject ? '' : 'cursor-pointer'}`}
                >
                  {!isProject && (
                    <div className="absolute -left-4 w-2 h-2 bg-[#ff3333] opacity-0 group-hover:opacity-100 transition-opacity z-50" />
                  )}
                  
                  <span className="font-mono text-sm opacity-50 mb-2 md:mb-0 w-24">
                    <ScrambleText text={project.id} scrambleToEmpty={isProject} />
                  </span>
                  
                  <span className="text-2xl md:text-4xl font-bold uppercase tracking-tight flex-1">
                    <ScrambleText text={project.title} scrambleToEmpty={isProject} />
                  </span>
                  
                  <span className="text-xs font-mono opacity-50 mr-8 hidden md:block">
                    <ScrambleText text={`Reference project ${project.id.split('-')[1]}`} scrambleToEmpty={isProject} />
                  </span>

                  {/* Status Box */}
                  <motion.div 
                    animate={{ opacity: isProject ? 0 : 0.2 }}
                    className="w-12 h-6 bg-current group-hover:opacity-100 transition-opacity" 
                  />
                </motion.div>
              ))}
            </div>
          </div>

        </main>

        {/* Footer */}
        <footer className="mt-auto pt-8 flex justify-between items-end border-t border-current opacity-50 text-xs font-mono uppercase tracking-widest">
          <div>
            <ScrambleText text="+ DECIMAL SEPARATION AND PROPERTIES OF POLYMER 48" scrambleToEmpty={isProject} /><br/>
            <ScrambleText text="+ I/O TECHNICAL SYSTEMS™" scrambleToEmpty={isProject} />
          </div>
          <div className="flex items-center gap-2">
            <ScrambleText text="System Offline" scrambleToEmpty={isProject} />
            <motion.div animate={{ opacity: isProject ? 0 : 1 }} className="w-3 h-3 rounded-full border border-current flex items-center justify-center">
              <div className="w-1 h-1 bg-current rounded-full" />
            </motion.div>
          </div>
        </footer>
      </motion.div>
    </div>
  )
}
