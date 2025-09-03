// Global fetch interceptor to catch and log "Failed to fetch" errors
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch

  window.fetch = async function(...args) {
    try {
      console.log('🌐 Fetch request:', args[0])
      const response = await originalFetch.apply(this, args)
      
      if (!response.ok) {
        console.error('❌ Fetch failed:', {
          url: args[0],
          status: response.status,
          statusText: response.statusText
        })
      } else {
        console.log('✅ Fetch success:', args[0])
      }
      
      return response
    } catch (error) {
      console.error('🚨 Fetch error:', {
        url: args[0],
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace'
      })
      throw error
    }
  }
}

export {}
