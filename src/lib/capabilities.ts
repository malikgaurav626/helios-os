export const forceWebGLFromUrl = () =>
  typeof location !== 'undefined' && new URLSearchParams(location.search).has('webgl')

export const supportsWebGPU = () =>
  typeof navigator !== 'undefined' && 'gpu' in navigator
