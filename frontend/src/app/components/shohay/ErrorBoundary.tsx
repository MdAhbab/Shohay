import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

/** App-level safety net: a render error in one route no longer blanks the whole SPA. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    // Surfaced for diagnostics; in prod this is where a reporter would hook in.
    console.error("Shohay render error:", error);
  }

  handleReset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="text-lg">কিছু একটা সমস্যা হয়েছে · Something went wrong</div>
        <p className="max-w-md text-sm text-ink-dim">
          পৃষ্ঠাটি লোড করা যায়নি। আবার চেষ্টা করুন।
          <br />
          This page failed to load. Please try again.
        </p>
        <button
          onClick={() => {
            this.handleReset();
            window.location.assign("/");
          }}
          className="rounded-full bg-river px-5 py-2.5 text-primary-foreground"
        >
          হোমে ফিরুন · Back to home
        </button>
      </div>
    );
  }
}
