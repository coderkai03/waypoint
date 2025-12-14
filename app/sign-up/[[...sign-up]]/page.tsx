import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
      <div className="w-full max-w-md px-6">
        <Link href="/" className="flex items-center justify-center mb-12 space-x-3 text-black dark:text-white hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-black dark:bg-white rounded"></div>
          <span className="text-lg font-medium">Waypoint</span>
        </Link>
        <SignUp
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-none border-0 bg-transparent',
              headerTitle: 'text-black dark:text-white',
              headerSubtitle: 'text-gray-600 dark:text-gray-400',
              socialButtonsBlockButton: 'border border-gray-300 dark:border-gray-700 hover:border-black dark:hover:border-white',
              formButtonPrimary: 'bg-black dark:bg-white text-white dark:text-black hover:opacity-80',
              formFieldInput: 'border-gray-300 dark:border-gray-700 focus:border-black dark:focus:border-white',
              footerActionLink: 'text-black dark:text-white',
            },
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          afterSignUpUrl="/canvas"
        />
      </div>
    </div>
  );
}

