import { Component, type ErrorInfo, type ReactNode } from 'react'

type SectionErrorBoundaryProps = {
  sectionName: string
  children: ReactNode
}

type SectionErrorBoundaryState = {
  hasError: boolean
}

class SectionErrorBoundary extends Component<SectionErrorBoundaryProps, SectionErrorBoundaryState> {
  override state: SectionErrorBoundaryState = {
    hasError: false
  }

  static getDerivedStateFromError(): SectionErrorBoundaryState {
    return { hasError: true }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Keep details in devtools while presenting a stable fallback to users.
    console.error(`[SectionErrorBoundary:${this.props.sectionName}]`, error, errorInfo)
  }

  private handleReset = (): void => {
    this.setState({ hasError: false })
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="rounded border border-rose-900/70 bg-rose-950/30 p-4 text-sm text-rose-200">
          <p className="font-semibold">{this.props.sectionName} failed to render.</p>
          <p className="mt-1 text-xs text-rose-300/90">
            Check recent changes or refresh the app. This failure is isolated to the affected panel.
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="mt-3 rounded border border-rose-700/80 px-2 py-1 text-xs text-rose-100"
          >
            Retry Panel
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default SectionErrorBoundary
