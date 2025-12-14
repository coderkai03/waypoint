import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CompassIcon } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xl font-medium text-foreground">
            <CompassIcon className="w-6 h-6" />
            <span>Waypoint</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="cursor-pointer">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer">
                Sign in
              </Button>
            </Link>
            <Link href="/sign-up" className="cursor-pointer">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">Sign up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-medium text-foreground tracking-tight text-balance">
              Plan events as a system.
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              From intent to execution, in one canvas.
            </p>
          </div>

          {/* CTA */}
          <div className="pt-4">
            <Link href="/canvas" className="cursor-pointer">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base cursor-pointer">
                Get started
              </Button>
            </Link>
          </div>

          {/* Canvas Preview */}
          <div className="pt-16 pb-8">
            <CanvasPreview />
          </div>
        </div>

        {/* Feature Section */}
        <div className="max-w-5xl mx-auto pt-24 pb-12">
          <div className="grid md:grid-cols-3 gap-12 md:gap-16">
            <div className="space-y-3 p-6 rounded-lg border border-border/50">
              <h3 className="text-lg font-medium text-foreground">Context-first planning</h3>
              <p className="text-muted-foreground leading-relaxed">
                Connect documents, spreadsheets, and locations directly to your event workflow.
              </p>
            </div>
            <div className="space-y-3 p-6 rounded-lg border border-border/50">
              <h3 className="text-lg font-medium text-foreground">AI that understands constraints</h3>
              <p className="text-muted-foreground leading-relaxed">
                An intelligent agent that works within your requirements and resources.
              </p>
            </div>
            <div className="space-y-3 p-6 rounded-lg border border-border/50">
              <h3 className="text-lg font-medium text-foreground">Execution, not just ideas</h3>
              <p className="text-muted-foreground leading-relaxed">
                Transform planning into actionable tasks and structured deliverables.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-sm text-muted-foreground">© Waypoint</p>
        </div>
      </footer>
    </div>
  )
}

function CanvasPreview() {
  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <svg viewBox="0 0 800 400" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="#4f46e5" />
          </marker>
        </defs>

        <g stroke="#4f46e5" strokeWidth="2" fill="none" strokeDasharray="4 4" markerEnd="url(#arrowhead)">
          {/* Left to center */}
          <path d="M 140 100 L 340 200" className="flow-edge" strokeDashoffset="0" />
          <path d="M 140 200 L 340 200" className="flow-edge" strokeDashoffset="0" />
          <path d="M 140 300 L 340 200" className="flow-edge" strokeDashoffset="0" />

          {/* Center to right */}
          <path d="M 460 200 L 660 140" className="flow-edge" strokeDashoffset="0" />
          <path d="M 460 200 L 660 260" className="flow-edge" strokeDashoffset="0" />
        </g>

        {/* Nodes */}
        {/* Left nodes - Input sources (purple/violet) */}
        <g className="hover-node">
          <rect x="40" y="80" width="100" height="40" rx="4" fill="#f5f3ff" stroke="#8b5cf6" strokeWidth="2" />
          <text
            x="90"
            y="105"
            fontSize="13"
            fill="#6d28d9"
            fontWeight="500"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            Location
          </text>
        </g>

        <g className="hover-node" style={{ animationDelay: "0.5s" }}>
          <rect x="40" y="180" width="100" height="40" rx="4" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
          <text
            x="90"
            y="205"
            fontSize="13"
            fill="#d97706"
            fontWeight="500"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            Google Doc
          </text>
        </g>

        <g className="hover-node" style={{ animationDelay: "1s" }}>
          <rect x="40" y="280" width="100" height="40" rx="4" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" />
          <text
            x="90"
            y="305"
            fontSize="13"
            fill="#1d4ed8"
            fontWeight="500"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            Spreadsheet
          </text>
        </g>

        {/* Center node (AI Agent) - Navy blue */}
        <g>
          <rect x="340" y="180" width="120" height="40" rx="4" fill="#312e81" stroke="#4f46e5" strokeWidth="2" />
          <text
            x="400"
            y="205"
            fontSize="14"
            fill="white"
            textAnchor="middle"
            fontWeight="600"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            AI Agent
          </text>
        </g>

        {/* Right nodes - Outputs (teal/green) */}
        <g className="hover-node" style={{ animationDelay: "1.5s" }}>
          <rect x="660" y="120" width="100" height="40" rx="4" fill="#d1fae5" stroke="#10b981" strokeWidth="2" />
          <text
            x="710"
            y="145"
            fontSize="13"
            fill="#047857"
            fontWeight="500"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            Event Plan
          </text>
        </g>

        <g className="hover-node" style={{ animationDelay: "2s" }}>
          <rect x="660" y="240" width="100" height="40" rx="4" fill="#d1fae5" stroke="#10b981" strokeWidth="2" />
          <text
            x="710"
            y="265"
            fontSize="13"
            fill="#047857"
            fontWeight="500"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            Tasks
          </text>
        </g>
      </svg>
    </div>
  )
}
