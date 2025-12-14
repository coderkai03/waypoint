'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { SignIn, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { CompassIcon, X } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for signin query parameter
  useEffect(() => {
    if (searchParams?.get('signin') === 'true' && !isSignedIn) {
      setShowAuthModal(true);
      // Clean up URL
      router.replace('/', { scroll: false });
    }
  }, [searchParams, isSignedIn, router]);

  const handleSignInClick = () => {
    setShowAuthModal(true);
  };

  return (
    <>
      <header className="border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link 
            href={isSignedIn ? '/canvas' : '/'}
            className="flex items-center gap-2 text-xl font-medium text-foreground hover:opacity-80 transition-opacity cursor-pointer"
          >
            <CompassIcon className="w-6 h-6" />
            <span>Waypoint</span>
          </Link>
          
          <div className="flex items-center gap-3">
            {!isLoaded ? (
              // Loading state
              <div className="w-20 h-9" />
            ) : isSignedIn ? (
              // Authenticated state
              <>
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: 'w-9 h-9',
                    },
                  }}
                />
              </>
            ) : (
              // Unauthenticated state
              <>
                <Button 
                  variant="ghost" 
                  className="text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer"
                  onClick={handleSignInClick}
                >
                  Sign in
                </Button>
                <Button 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                  onClick={handleSignInClick}
                >
                  Sign up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      {showAuthModal && !isSignedIn && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowAuthModal(false)}
        >
          <div 
            className="relative bg-background border border-border rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-6">
              <SignIn
                appearance={{
                  elements: {
                    rootBox: 'mx-auto',
                    card: 'shadow-none border-0 bg-transparent',
                    headerTitle: 'text-foreground',
                    headerSubtitle: 'text-muted-foreground',
                    socialButtonsBlockButton: 'border border-border hover:border-foreground',
                    formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
                    formFieldInput: 'border-border focus:border-primary',
                    footerActionLink: 'text-primary hover:text-primary/80',
                  },
                }}
                routing="hash"
                afterSignInUrl="/canvas"
                afterSignUpUrl="/canvas"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
