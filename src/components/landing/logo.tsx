import Link from "next/link"

const ScriptorLogo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#F5B638]">
    {/* Film reel base */}
    <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2"/>
    
    {/* Screenplay lines */}
    <rect x="12" y="8" width="12" height="2" rx="1" fill="currentColor"/>
    <rect x="8" y="12" width="16" height="2" rx="1" fill="currentColor"/>
    <rect x="8" y="16" width="16" height="2" rx="1" fill="currentColor"/>
    <rect x="8" y="20" width="12" height="2" rx="1" fill="currentColor"/>
    
    {/* Pen tip */}
    <path 
      d="M6 22L8 20L10 22L8 24L6 22Z" 
      fill="currentColor"
    />
    
    {/* Film sprocket holes */}
    <circle cx="4" cy="12" r="1" fill="currentColor"/>
    <circle cx="4" cy="16" r="1" fill="currentColor"/>
    <circle cx="4" cy="20" r="1" fill="currentColor"/>
    <circle cx="28" cy="12" r="1" fill="currentColor"/>
    <circle cx="28" cy="16" r="1" fill="currentColor"/>
    <circle cx="28" cy="20" r="1" fill="currentColor"/>
  </svg>
)

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3 group">
      <div className="relative">
        <ScriptorLogo />
        <div className="absolute inset-0 bg-[#F5B638] opacity-40 blur-lg rounded-full group-hover:opacity-60 transition-opacity"></div>
      </div>
      <span className="flex flex-col">
        <span className="text-2xl tracking-tight font-bold bg-gradient-to-r from-[#F5B638] to-[#F6C05C] bg-clip-text text-transparent">
          Scriptor
        </span>
        <span className="text-[10px] tracking-widest text-gray-400 -mt-1">
          SCREENWRITING TOOLS
        </span>
      </span>
    </Link>
  )
}

