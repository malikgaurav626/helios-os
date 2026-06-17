import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

export interface ProjectMeta {
  id: string
  title: string
  blurb: string
  description: string
  accent: string
  cityCoordinates: [number, number, number]
  Scene: LazyExoticComponent<ComponentType<any>>
  Content: LazyExoticComponent<ComponentType<any>>
}

// Generate Fibonacci Sphere positions
const generateFibonacciPositions = (n: number, radius: number = 5): [number, number, number][] => {
  const positions: [number, number, number][] = []
  const phi = Math.PI * (3 - Math.sqrt(5)) // Golden angle

  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2 // y goes from 1 to -1
    const radiusAtY = Math.sqrt(1 - y * y) * radius
    const theta = phi * i
    const x = Math.cos(theta) * radiusAtY
    const z = Math.sin(theta) * radiusAtY
    positions.push([x, y * radius, z])
  }
  return positions
}

const positions = generateFibonacciPositions(3, 4)

export const PROJECTS: ProjectMeta[] = [
  {
    id: 'demo-1',
    title: 'Portal Demo 1',
    blurb: 'Reference project 1',
    description: 'A SPATIAL ANOMALY DETECTED IN THE OUTER RIM. PRELIMINARY SCANS INDICATE A HIGH DENSITY OF CONDENSED DARK MATTER CONVERGING INTO A SINGULARITY. CAUTION IS ADVISED WHEN APPROACHING THE EVENT HORIZON.',
    accent: '#5ab0ff',
    cityCoordinates: positions[0],
    Scene: lazy(() => import('@/projects/demo-1/Scene')),
    Content: lazy(() => import('@/projects/demo-1/Content')),
  },
  {
    id: 'demo-2',
    title: 'Portal Demo 2',
    blurb: 'Reference project 2',
    description: 'THE MECHANICAL CONSTRUCTS BENEATH THE SURFACE HAVE AWAKENED. SEISMIC ACTIVITY IS OFF THE CHARTS. THE FORGE OF THE ANCIENTS HAS BEEN IGNITED ONCE MORE, POURING MOLTEN ENERGY INTO THE CORE MATRIX.',
    accent: '#ff5ab0',
    cityCoordinates: positions[1],
    Scene: lazy(() => import('@/projects/demo-2/Scene')),
    Content: lazy(() => import('@/projects/demo-2/Content')),
  },
  {
    id: 'demo-3',
    title: 'Portal Demo 3',
    blurb: 'Reference project 3',
    description: 'BIOMETRIC SIGNATURES CONFIRM THE EXISTENCE OF AN ARTIFICIAL CONSCIOUSNESS SPREADING THROUGH THE NETWORK. ALL QUARANTINE PROTOCOLS HAVE FAILED. THE SYNTHESIS OF BIOLOGY AND MACHINE IS NOW COMPLETE.',
    accent: '#b05aff',
    cityCoordinates: positions[2],
    Scene: lazy(() => import('@/projects/demo-3/Scene')),
    Content: lazy(() => import('@/projects/demo-3/Content')),
  }
]

export const getProject = (id: string) => PROJECTS.find((p) => p.id === id)
