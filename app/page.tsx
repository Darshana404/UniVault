import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between overflow-hidden">
      {/* Subtle background glow effect */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-teal-500/10 blur-[120px] rounded-full"
        aria-hidden="true"
      />

      {/* Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-lg shadow-sm group-hover:border-teal-400 transition-colors">
              <svg
                className="w-4 h-4 text-teal-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
                />
              </svg>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">Uni</span>
              <span className="text-xl font-bold tracking-tight text-teal-400">Vault</span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold transition-all shadow-sm hover:shadow-teal-500/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center z-10">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            University-Gated Academic Sharing
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight sm:leading-none mb-6">
            The Secure Academic Vault for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">
              University Students
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed mb-10">
            Upload, discover, and organize lecture notes, study materials, and past
            papers. Authenticated exclusively through verified institutional email domains.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-base transition-all shadow-lg shadow-teal-500/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Access Your Vault</span>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 font-medium text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Browse Documents</span>
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-24 text-left w-full">
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/40 backdrop-blur-sm hover:border-slate-600/60 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Verified University Access</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              No passwords to remember. One-time code verification restricted strictly to registered university email domains.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/40 backdrop-blur-sm hover:border-slate-600/60 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Academic PDF Repository</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Organized by course and semester. Access vetted lecture slides, textbook highlights, and past semester papers.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/40 backdrop-blur-sm hover:border-slate-600/60 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Instant Search & Vectors</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Find exactly what you need quickly with semantic document embeddings and category filters.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} UniVault — Academic Resource Platform</p>
          <div className="flex gap-6">
            <Link href="/login" className="hover:text-slate-400 transition-colors">
              Login
            </Link>
            <span className="text-slate-700">•</span>
            <span className="text-slate-500">Encrypted Storage</span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-500">Protected Access</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
