import { Navigate } from 'react-router-dom'

// Redirect to dashboard as the main entry point
function Index(): React.ReactElement {
  return <Navigate to="/" replace />
}

export default Index
