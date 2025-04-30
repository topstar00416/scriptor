import Link from 'next/link'

import Logo from '@/components/landing/logo'

export default function Page() {
  return (
    <div className='min-h-screen bg-[#0B0D14] overflow-hidden relative'>
      {/* Background Effects */}
      <div className='absolute inset-0 bg-gradient-to-br from-[#0B0D14] via-[#131628] to-[#1B1535] opacity-80'></div>
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(24,24,64,0.2),rgba(24,24,64,0))]'></div>
      <div className='absolute top-0 left-0 w-full h-full'>
        <div className='absolute top-[20%] left-[10%] w-[300px] h-[300px] bg-[#F5B638] rounded-full filter blur-[128px] opacity-20'></div>
        <div className='absolute bottom-[20%] right-[10%] w-[250px] h-[250px] bg-[#6366F1] rounded-full filter blur-[128px] opacity-10'></div>
      </div>

      {/* Content */}
      <div className='relative z-10'>
        <header className='w-full bg-transparent/5 backdrop-blur-sm fixed top-0 z-50 border-b border-white/5'>
          <div className='container mx-auto px-8 py-4 flex items-center justify-between'>
            <div className='flex items-center'>
              <Logo />
            </div>
            <div className='flex items-center gap-6'>
              <Link href='/login' className='text-white/80 hover:text-white transition-colors text-sm'>
                Login
              </Link>
              <Link
                href='/register'
                className='bg-[#F5B638] hover:bg-[#f6c05c] text-black px-6 py-2 rounded-md text-sm font-medium transition-all hover:shadow-[0_0_20px_rgba(245,182,56,0.3)] active:scale-95'
              >
                Get Started
              </Link>
            </div>
          </div>
        </header>

        <main className='pt-32 min-h-screen'>
          <div className='container mx-auto px-8'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-16 items-center'>
              <div className='space-y-8 relative'>
                <div className='absolute -left-12 -top-12 w-32 h-32 bg-[#F5B638] rounded-full filter blur-[120px] opacity-20'></div>
                <h1 className='text-5xl lg:text-7xl font-bold tracking-tight relative'>
                  <span className='text-[#F5B638] inline-block relative'>
                    AI-Powered
                    <div className='absolute -inset-1 bg-[#F5B638] opacity-20 blur-lg rounded-lg'></div>
                  </span>
                  <br />
                  <span className='text-white'>Screenwriting for</span>
                  <br />
                  <span className='text-white'>Modern Filmmakers</span>
                </h1>
                <p className='text-white/80 text-lg max-w-xl leading-relaxed'>
                  Transform your film ideas into professional screenplays with Scriptor. Generate beat sheets, formatted
                  scenes, and script rewrites with AI assistance.
                </p>
                <div className='flex gap-4 pt-4'>
                  <Link
                    href='/register'
                    className='group bg-[#F5B638] hover:bg-[#f6c05c] text-black px-8 py-3 rounded-md font-medium transition-all hover:shadow-[0_0_30px_rgba(245,182,56,0.3)] active:scale-95 relative overflow-hidden'
                  >
                    <span className='relative z-10'>Start Writing For Free</span>
                    <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000'></div>
                  </Link>
                </div>
                <div className='flex items-center gap-4 pt-8'>
                  <div className='flex -space-x-3'>
                    <div className='w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border-2 border-[#0B0D14] flex items-center justify-center'>
                      <span className='text-xs text-white/90'>JD</span>
                    </div>
                    <div className='w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border-2 border-[#0B0D14] flex items-center justify-center'>
                      <span className='text-xs text-white/90'>MR</span>
                    </div>
                    <div className='w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border-2 border-[#0B0D14] flex items-center justify-center'>
                      <span className='text-xs text-white/90'>AS</span>
                    </div>
                  </div>
                  <p className='text-white/60 text-sm'>
                    Trusted by <span className='text-white font-medium'>1,000+</span> screenwriters & filmmakers
                  </p>
                </div>
              </div>
              <div className='relative'>
                <div className='absolute -inset-4 bg-gradient-to-r from-[#F5B638]/10 to-[#6366F1]/10 blur-2xl rounded-xl opacity-50'></div>
                <div className='relative bg-[#1B1F2E]/90 backdrop-blur-sm rounded-lg p-8 font-mono text-sm text-gray-300 shadow-2xl border border-white/5'>
                  <div className='flex gap-2 mb-6'>
                    <div className='w-3 h-3 rounded-full bg-red-500/80'></div>
                    <div className='w-3 h-3 rounded-full bg-yellow-500/80'></div>
                    <div className='w-3 h-3 rounded-full bg-green-500/80'></div>
                  </div>
                  <div className='text-xs text-gray-500 mb-4'>FADE IN:</div>
                  <div className='mb-4'>INT. HIGH-TECH OFFICE - DAY</div>
                  <div className='mb-6'>
                    A sleek, minimalist workspace. ALEX (30s, determined) sits at a desk, surrounded by multiple
                    monitors displaying screenplay drafts.
                  </div>
                  <div className='mb-2'>ALEX</div>
                  <div className='mb-4 pl-8'>(frustrated)</div>
                  <div className='mb-6 pl-8'>{`This scene just doesn't work. I've rewritten it ten times already...`}</div>
                  <div className='mb-4'>
                    {`Alex sighs, then notices an app icon on the screen: "Scriptor". After a moment of consideration,`}
                    {`Alex clicks it.`}
                  </div>
                  <div className='mb-4'>The screen transforms, AI tools coming to life.</div>
                  <div className='text-[#F5B638] animate-pulse'>
                    Scriptor generating solutions...
                    <span className='inline-block animate-bounce ml-1'>|</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
