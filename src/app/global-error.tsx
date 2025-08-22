'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div style={{ padding: '20px', fontFamily: 'monospace' }}>
          <h1>🚨 Global Error Handler</h1>
          <p><strong>Error:</strong> {error.message}</p>
          <p><strong>Stack:</strong></p>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
            {error.stack}
          </pre>
          <button onClick={() => reset()}>Try again</button>
        </div>
      </body>
    </html>
  )
}
