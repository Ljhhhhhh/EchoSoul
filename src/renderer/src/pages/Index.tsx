import React from 'react'
import { Navigate } from 'react-router-dom'

// Redirect to dashboard as the main entry point
function Index() {
  return <Navigate to="/" replace />
}

export default Index
