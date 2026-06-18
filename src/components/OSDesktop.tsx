import { motion, AnimatePresence, useAnimation } from 'motion/react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { PROJECTS } from '@/projects/registry'
import { useAppStore } from '@/store/useAppStore'
import { ScrambleText } from './ScrambleText'

const CIRCLE_PRESETS = [
  { c1: { cx: '20%', cy: '40%', r: '40%' }, c2: { cx: '30%', cy: '50%', r: '60%' } },
  { c1: { cx: '80%', cy: '10%', r: '50%' }, c2: { cx: '70%', cy: '80%', r: '45%' } },
  { c1: { cx: '50%', cy: '50%', r: '75%' }, c2: { cx: '10%', cy: '90%', r: '30%' } },
  { c1: { cx: '-10%', cy: '50%', r: '80%' }, c2: { cx: '110%', cy: '50%', r: '80%' } },
]

export function OSDesktop({ theme, isThemeTransition }: { theme?: 'light' | 'dark', isThemeTransition?: boolean }) {
  const { enterProject, exitProject, activeProjectId } = useAppStore()
  const [presetIdx, setPresetIdx] = useState(0)
  const [hasScrolled, setHasScrolled] = useState(false)
  const listControls = useAnimation()
  
  const [showDetails, setShowDetails] = useState(!!(isThemeTransition && activeProjectId))
  const [isExiting, setIsExiting] = useState(false)
  const isExitingRef = useRef(false)

  // Sequence the project entry
  useEffect(() => {
    if (activeProjectId && !isExiting) {
      const timer = setTimeout(() => setShowDetails(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [activeProjectId, isExiting])

  const handleReturnToRegistry = () => {
    if (isExitingRef.current) return
    isExitingRef.current = true
    setIsExiting(true)
  }

  const handleScrambleOutComplete = useCallback(() => {
    if (isExitingRef.current) {
      exitProject()
      setShowDetails(false)
      setIsExiting(false)
      isExitingRef.current = false
    }
  }, [exitProject])

  useEffect(() => {
    // Whenever we enter or exit a project, shift the background circles
    setPresetIdx(prev => (prev + 1) % CIRCLE_PRESETS.length)
  }, [activeProjectId])

  // Demo elastic scroll to hint at scrollability (runs only once)
  useEffect(() => {
    let isActive = true

    const runOnce = async () => {
      await new Promise(r => setTimeout(r, 2500)) // Initial wait

      if (isActive && !activeProjectId && !hasScrolled) {
        // Pull content UP quickly (y: -120) to simulate scrolling down into the list
        await listControls.start({ y: -120, transition: { duration: 0.4, ease: 'easeOut' } })
        
        if (isActive && !hasScrolled) {
          // Release and let it snap back DOWN into place buoyantly
          await listControls.start({ y: 0, transition: { type: 'spring', stiffness: 400, damping: 10, mass: 1 } })
        }
      }
    }

    if (!hasScrolled && !activeProjectId) {
      runOnce()
    }

    return () => {
      isActive = false
    }
  }, [activeProjectId, listControls, hasScrolled])

  const handleUserScroll = () => {
    if (!hasScrolled) {
      setHasScrolled(true)
      listControls.stop()
      listControls.start({ y: 0, transition: { duration: 0.2 } })
    }
  }

  const preset = CIRCLE_PRESETS[presetIdx]
  const isProject = !!activeProjectId
  const activeProject = PROJECTS.find(p => p.id === activeProjectId)

  const showProjectInfo = isProject && !isExiting

  const titleText = showProjectInfo && activeProject ? activeProject.title : "GAURAV :\nGENESIS III"
  
  const descText = showProjectInfo && activeProject 
    ? activeProject.description
    : "SOFTWARE ENGINEER SPECIALIZING IN HIGH-PERFORMANCE\nWEB APPLICATIONS, 3D GRAPHICS, AND UI/UX DESIGN.\nDRIVEN BY INNOVATION, TECHNICAL PRECISION, AND\nSCALABLE SYSTEM ARCHITECTURE."

  const metaText = showProjectInfo && activeProject 
    ? `PROJECT: ${activeProject.id.toUpperCase()}\nSTATUS: RETRIEVED\nAUTH: CLEARED`
    : `USER: GAURAV_MALIK\nSYSID: HELIOS_OS\nSTATUS: ACTIVE`

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
            {/* Logo */}
            <div className="flex items-center gap-4 cursor-pointer select-none" onClick={handleReturnToRegistry}>
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
        <main className="flex-1 grid grid-cols-12 gap-8 items-center h-full min-h-0">
          
          {/* Left Column: Huge Brutalist Text */}
          <div className="col-span-12 md:col-span-5 flex flex-col justify-center">
            <div className="flex flex-col relative w-fit mt-12 mb-12">
               <motion.span 
                 className="absolute -left-6 top-2 text-[#ff3333] text-sm"
                 animate={{ opacity: [1, 0, 1] }}
                 transition={{ repeat: Infinity, duration: 1.5, ease: "steps(2)" }}
               >
                 ■
               </motion.span>
               <h2 className="text-6xl lg:text-7xl xl:text-8xl font-black uppercase tracking-tighter leading-[0.85] whitespace-pre-line break-words max-w-full">
                 <ScrambleText text={titleText} />
               </h2>
            </div>

            <div className="mt-8 pl-4 border-l-2 border-current max-w-md flex flex-col">
              <p className="text-xs font-mono uppercase tracking-widest opacity-60 leading-relaxed whitespace-pre-line">
                <ScrambleText text={descText} />
              </p>
              
              <AnimatePresence>
                {showDetails && activeProject && (
                  <motion.div 
                    initial={{ opacity: isThemeTransition ? 1 : 0 }} 
                    animate={{ opacity: 1, transition: { duration: 0.2 } }} 
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    className="mt-8 flex flex-col gap-4 pointer-events-auto"
                  >
                    <div className="flex flex-wrap gap-2">
                    {activeProject.techStack?.map(tech => (
                      <span key={tech} className="px-2 py-1 text-[10px] font-mono border border-current opacity-60 uppercase">
                        <ScrambleText text={tech} animateOnMount={!isThemeTransition} scrambleToEmpty={isExiting} />
                      </span>
                    ))}
                    </div>
                    <div className="flex gap-4 text-xs font-mono tracking-widest mt-2">
                      {activeProject.githubUrl && <a href={activeProject.githubUrl} target="_blank" rel="noreferrer" className="opacity-60 hover:opacity-100 transition-colors">[ SOURCE ]</a>}
                      {activeProject.liveUrl && <a href={activeProject.liveUrl} target="_blank" rel="noreferrer" className="text-[#ff3333] opacity-80 hover:opacity-100 transition-colors">[ DEPLOYMENT ]</a>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: Project Registry */}
          <div className="col-span-12 md:col-span-7 flex flex-col justify-end h-full min-h-0 py-8">
            <div className="border-b border-current mb-4 pb-2 text-xs font-mono uppercase tracking-widest flex justify-between shrink-0">
              <ScrambleText text="Artifact ID" scrambleToEmpty={isProject} />
              <ScrambleText text="Designation" scrambleToEmpty={isProject} />
              <ScrambleText text="Status" scrambleToEmpty={isProject} />
            </div>

            <div className="relative flex flex-col flex-1 min-h-0 pb-12">
              
              <div 
                onScroll={handleUserScroll}
                className={`absolute inset-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${isProject ? 'pointer-events-none' : ''}`}
              >
                <motion.div animate={listControls} className="flex flex-col">
                {PROJECTS.map((project) => (
                  <motion.div 
                    key={project.id}
                    whileHover={!isProject ? { x: 10 } : {}}
                    onClick={() => !isProject && enterProject(project.id)}
                    className={`group relative flex flex-col md:flex-row justify-between items-start md:items-center py-4 shrink-0 transition-colors duration-1000 ${isProject ? 'border-transparent' : 'border-b border-current cursor-pointer'}`}
                  >
                    {!isProject && (
                      <div className="absolute -left-4 w-2 h-2 bg-[#ff3333] opacity-0 group-hover:opacity-100 transition-opacity z-50" />
                    )}
                    
                    <span className="font-mono text-sm opacity-50 mb-2 md:mb-0 w-24">
                      <ScrambleText text={project.id} scrambleToEmpty={isProject} />
                    </span>
                    
                    <span className="text-2xl md:text-4xl font-bold uppercase tracking-tight flex-1">
                      <ScrambleText text={project.title.replace(/\n/g, ' ')} scrambleToEmpty={isProject} />
                    </span>
                    
                    <span className="text-xs font-mono opacity-50 mr-8 hidden md:block">
                      <ScrambleText text={`REF_${project.id.slice(-4).toUpperCase()}`} scrambleToEmpty={isProject} />
                    </span>

                    {/* Status Box */}
                    <div className="flex justify-end min-w-[6rem] shrink-0">
                      <motion.div 
                        animate={{ opacity: isProject ? 0 : 1 }}
                        className="flex items-center justify-center h-6 pl-2 pr-4 min-w-[3rem] bg-black/20 dark:bg-white/20 group-hover:bg-[#ff3333] dark:group-hover:bg-[#ff3333] transition-colors"
                      >
                        <span className={`text-[10px] font-mono tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                          <ScrambleText text={project.status || 'ACTIVE'} scrambleToEmpty={isProject} />
                        </span>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
                </motion.div>
              </div>

              <AnimatePresence>
                {showDetails && activeProject && (
                  <motion.div 
                    initial={{ opacity: 1 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    className="absolute inset-0 pt-4 pb-12 flex flex-col gap-6 pointer-events-auto overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                  >
                    <h3 className="text-xl font-bold tracking-widest uppercase border-b border-current pb-2 mb-4 opacity-80">
                      <ScrambleText 
                        text="SYSTEM_LOG // EXTENDED_ANALYSIS" 
                        animateOnMount={!isThemeTransition}
                        scrambleToEmpty={isExiting} 
                        onComplete={handleScrambleOutComplete}
                      />
                    </h3>
                    {activeProject.extendedDetails?.map((detail, idx) => (
                      <div key={idx} className="flex gap-4">
                        <span className="text-[#ff3333] font-bold mt-1">
                          <ScrambleText text={`[${idx + 1}]`} animateOnMount={!isThemeTransition} scrambleToEmpty={isExiting} />
                        </span>
                        <p className="font-mono text-sm uppercase tracking-wider opacity-80 leading-relaxed">
                          <ScrambleText text={detail} animateOnMount={!isThemeTransition} scrambleToEmpty={isExiting} />
                        </p>
                      </div>
                    ))}
                    <button 
                      onClick={handleReturnToRegistry} 
                      className={`mt-8 self-start border border-current px-6 py-2 text-xs font-bold tracking-widest transition-colors uppercase select-none pointer-events-auto ${theme === 'light' ? 'hover:bg-black hover:text-white' : 'hover:bg-white hover:text-black'}`}
                    >
                      <ScrambleText text="[ RETURN_TO_REGISTRY ]" animateOnMount={!isThemeTransition} scrambleToEmpty={isExiting} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </main>

        {/* Footer */}
        <footer className={`mt-auto pt-8 flex justify-between items-end border-t ${theme === 'light' ? 'border-black/50' : 'border-white/50'} text-xs font-mono uppercase tracking-widest`}>
          <div className="opacity-50">
            <ScrambleText text="+ DECIMAL SEPARATION AND PROPERTIES OF POLYMER 48" scrambleToEmpty={isProject} /><br/>
            <ScrambleText text="+ I/O TECHNICAL SYSTEMS™" scrambleToEmpty={isProject} />
          </div>
          <div className="flex items-center gap-2">
            <span className="opacity-50"><ScrambleText text="System Online" scrambleToEmpty={isProject} /></span>
            <motion.div animate={{ opacity: isProject ? 0 : 1 }} className={`w-3 h-3 rounded-full border ${theme === 'light' ? 'border-black/50' : 'border-white/50'} flex items-center justify-center`}>
              <div className="w-1 h-1 bg-[#ff3333] rounded-full" />
            </motion.div>
          </div>
        </footer>
      </motion.div>
    </div>
  )
}
