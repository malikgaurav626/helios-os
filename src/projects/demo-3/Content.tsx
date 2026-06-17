import { motion } from 'motion/react'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as any } },
}

export default function Content() {
  return (
    <motion.article variants={container} initial="hidden" animate="show"
      className="pointer-events-auto mx-auto max-w-prose space-y-4 px-4 sm:px-6 lg:px-8">
      <motion.h2 variants={item} className="text-2xl sm:text-3xl font-semibold">Portal Demo 3</motion.h2>
      <motion.p variants={item} className="opacity-80">This is the third placeholder demo project.</motion.p>
    </motion.article>
  )
}
