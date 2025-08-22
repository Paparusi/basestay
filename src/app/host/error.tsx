'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-xl font-bold text-red-600 mb-4">❌ Error in Host Section</h1>
        <p className="text-gray-700 mb-4">
          <strong>Message:</strong> {error.message}
        </p>
        {error.digest && (
          <p className="text-gray-500 text-sm mb-4">
            <strong>Error ID:</strong> {error.digest}
          </p>
        )}
        <details className="mb-4">
          <summary className="cursor-pointer text-blue-600">Show Error Stack</summary>
          <pre className="bg-gray-100 p-2 mt-2 text-xs overflow-auto">
            {error.stack}
          </pre>
        </details>
        <div className="flex gap-2">
          <button
            onClick={() => reset()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  )
}
