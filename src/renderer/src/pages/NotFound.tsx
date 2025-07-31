import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-8 p-4 text-center">
      <div className="space-y-4">
        <h1 className="text-6xl md:text-8xl font-bold text-primary/80">404</h1>
        <h2 className="text-2xl md:text-4xl font-semibold text-foreground">Oops! Page Not Found</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed, or is
          temporarily unavailable.
        </p>
      </div>

      <Link to="/">
        <Button variant="outline" size="lg" className="space-x-2">
          <Home className="w-5 h-5" />
          <span>Back to Home</span>
        </Button>
      </Link>
    </div>
  )
}

export default NotFound
