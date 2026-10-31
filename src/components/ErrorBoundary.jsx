import React, { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', background: '#FFF4E5', border: '3px solid #151515', margin: '20px', borderRadius: '18px', color: '#151515', fontFamily: 'sans-serif' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>🚨 Oops! A client rendering error occurred:</h2>
          <pre style={{ background: '#FFE4E4', padding: '16px', borderRadius: '10px', overflowX: 'auto', border: '2px solid #B91C1C', color: '#B91C1C', fontWeight: 'bold' }}>
            {this.state.error && this.state.error.toString()}
          </pre>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            style={{ marginTop: '16px', padding: '10px 20px', background: '#FF6B2B', color: '#fff', border: '2px solid #151515', borderRadius: '999px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Reset & Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

