'use client';
import { Component, ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0a0a0c', color:'#fff', fontFamily:'monospace', flexDirection:'column', gap:16 }}>
          <div style={{ fontSize:24 }}>Something went wrong</div>
          <div style={{ fontSize:13, color:'#aaa' }}>{this.state.error?.message}</div>
          <button onClick={() => window.location.reload()} style={{ padding:'8px 20px', background:'#1e64d8', border:'none', color:'#fff', cursor:'pointer', borderRadius:4 }}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
