export interface ProjectMeta {
  id: string
  title: string
  blurb: string
  description: string
  accent: string
  cityCoordinates: [number, number, number]
  techStack: string[]
  githubUrl?: string
  liveUrl?: string
  extendedDetails?: string[]
  status?: string
}

export const PROJECTS: ProjectMeta[] = [
  {
    id: 'prj-pcld',
    title: 'PCLD',
    blurb: 'Particle Cloud Processor',
    description: 'Premium interactive WebGL application built with React, TypeScript, React Three Fiber, and custom GLSL shaders.',
    accent: '#33ff33',
    cityCoordinates: [-400, 600, 800],
    techStack: ['TypeScript', 'Three.js', 'React Three Fiber', 'GLSL'],
    liveUrl: 'https://pcld.netlify.app/',
    githubUrl: 'https://github.com/malikgaurav626/pcld',
    extendedDetails: [
      'Created a premium interactive WebGL application that converts user-uploaded images into dense 3D particle fields and topographic lines.',
      'Engineered multiple render modes (PARTICLES and LINES) with seamless toggling and bespoke retro-futuristic themes.',
      'Integrated a GPU trail buffer enabling fluid-like wave displacements upon cursor interaction.',
      'Implemented real-time sampling controls for Alpha, Luma, and Edge parameters, supporting high-resolution transparent PNG exports.'
    ],
    status: 'ACTIVE'
  },
  {
    id: 'prj-polaris',
    title: 'POLARIS',
    blurb: 'Celestial Simulation',
    description: 'A highly detailed interactive celestial simulation engine powered by raw point cloud data. Designed for exploration of the unknown.',
    accent: '#00ffcc',
    cityCoordinates: [0, 400, -200],
    techStack: ['TypeScript', 'React', 'Three.js'],
    githubUrl: 'https://github.com/malikgaurav626/polaris',
    liveUrl: 'https://polariscore.netlify.app/',
    extendedDetails: [
      'Built a cutting-edge 3D web engine to render extreme-density celestial point clouds.',
      'Implemented distinct operational interfaces: Standard Mode for casual observation and Experimental Mode for advanced tactical telemetry.',
      'Engineered with React, Three.js, and TypeScript for robust GPU-accelerated graphics processing.'
    ],
    status: 'OFFLINE'
  },
  {
    id: 'prj-polaris-forge',
    title: 'POLARIS\nFORGE',
    blurb: '3D Geometry Sampler',
    description: 'High-density 3D geometry sampler for the Polaris engine. Converts ultra-dense celestial models into highly optimized binary data.',
    accent: '#ffaa00',
    cityCoordinates: [300, -200, 400],
    techStack: ['Python', 'NumPy', 'Trimesh'],
    githubUrl: 'https://github.com/malikgaurav626/polaris-forge',
    extendedDetails: [
      'Designed a proprietary Python pipeline acting as the primary data ingestion layer for the Polaris Web Engine.',
      'Developed stochastic sampling algorithms across high-resolution 3D meshes to extract point cloud data.',
      'Optimized data structure compiling millions of particles into ultra-fast binary formats for web delivery.'
    ],
    status: 'MAINTENANCE'
  },
  {
    id: 'prj-forex',
    title: 'FOREX\nDOMINANT',
    blurb: 'Trading Services Platform',
    description: 'An Online Trading Services Platform; tested and optimized calculator algorithms for accuracy and performance under various market conditions.',
    accent: '#00ffcc',
    cityCoordinates: [1200, 400, 800],
    techStack: ['Javascript', 'RestAPIs', 'WordPress'],
    liveUrl: 'http://forexdominant.com/',
    extendedDetails: [
      'Developed and deployed an end-to-end online trading services platform catering to forex traders.',
      'Designed and tested sophisticated calculator algorithms to ensure extreme accuracy during volatile market conditions.',
      'Integrated real-time financial APIs to track currency pairs and automatically update frontend dashboards.'
    ]
  },
  {
    id: 'prj-zyrithra',
    title: 'ZYRITHRA',
    blurb: 'Web3 Platform',
    description: 'A Web3 platform with a live dashboard tracking digital assets and market movements.',
    accent: '#ff3366',
    cityCoordinates: [-800, 600, 400],
    techStack: ['HTML', 'CSS', 'Javascript', 'React', 'Anime.js'],
    liveUrl: 'https://zyrithra.netlify.app/',
    extendedDetails: [
      'Architected a sleek Web3 platform featuring a live dashboard for tracking digital assets.',
      'Implemented fluid micro-interactions and data visualizations using Anime.js and React.',
      'Ensured high-performance rendering of rapidly changing blockchain state data.'
    ]
  },
  {
    id: 'prj-cosmic',
    title: 'COSMIC\nROUTE',
    blurb: '3D Solar System',
    description: 'A Three.js powered solar system experience, which includes all the planets of our solar system within a 3D environment.',
    accent: '#a200ff',
    cityCoordinates: [500, 1200, -600],
    techStack: ['HTML', 'CSS', 'JavaScript', 'React', 'Redux', 'Three.js', 'React-Fiber'],
    liveUrl: 'https://cosmicroute.netlify.app/',
    extendedDetails: [
      'Built a fully interactive, to-scale 3D solar system using React Three Fiber.',
      'Implemented custom orbital mechanics, planetary rotations, and high-resolution texture mapping.',
      'Utilized Redux for global state management controlling camera transitions and cinematic flybys.'
    ]
  },
  {
    id: 'prj-gans',
    title: 'GAN DEPTH\nESTIMATION',
    blurb: 'Neural Network R&D',
    description: 'Explored the design, training, and evaluation of neural network architectures for various applications, specifically GANs for efficient depth map estimation.',
    accent: '#ffcc00',
    cityCoordinates: [-1000, 200, -1000],
    techStack: ['Neural Networks', 'Math', 'Python', 'Tensorflow', 'Pandas'],
    extendedDetails: [
      'Conducted extensive R&D on Generative Adversarial Networks (GANs) for generating single-image depth maps.',
      'Engineered and trained custom generator/discriminator models using Tensorflow and Pandas.',
      'Achieved highly optimized inference times enabling efficient depth map estimation for 3D applications.'
    ]
  },
  {
    id: 'prj-alumni',
    title: 'ALUMNI\nBACKEND',
    blurb: 'Management System',
    description: 'Backend services for an alumni management system, handling user data, authentication, and directory logic.',
    accent: '#8800ff',
    cityCoordinates: [800, -500, 100],
    techStack: ['JavaScript', 'Node.js', 'Express'],
    githubUrl: 'https://github.com/malikgaurav626/alumni-backend',
    liveUrl: 'https://jitenderport.netlify.app/',
    extendedDetails: [
      'Engineered robust RESTful backend services to support an alumni management ecosystem.',
      'Implemented secure authentication, session management, and encrypted data storage.',
      'Designed scalable database schemas to handle large alumni directories and networking data.'
    ]
  },
  {
    id: 'prj-neonotes',
    title: 'NEONOTES',
    blurb: 'Note Taking Application',
    description: 'A minimal, high-performance note-taking application designed for rapid thought capture.',
    accent: '#eeff00',
    cityCoordinates: [100, 800, 1200],
    techStack: ['JavaScript', 'React', 'CSS'],
    githubUrl: 'https://github.com/malikgaurav626/neonotes',
    liveUrl: 'https://neonotes-local.netlify.app/',
    extendedDetails: [
      'Developed a blazing fast note-taking client focused on raw speed and brutalist aesthetics.',
      'Implemented robust local state management for instant cross-session data persistence.',
      'Designed a distraction-free typing interface.'
    ]
  }
]
