import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-red-900/90 text-white p-8 overflow-auto">
          <div className="max-w-3xl w-full space-y-4">
            <h1 className="text-2xl font-bold text-red-200">React Error Boundary</h1>
            <pre className="p-4 bg-black/50 rounded overflow-auto text-sm font-mono whitespace-pre-wrap break-all">
              {this.state.error && this.state.error.toString()}
              {'\n'}
              {this.state.errorInfo?.componentStack}
            </pre>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-white text-red-900 rounded">
              Reload
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
