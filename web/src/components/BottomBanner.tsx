import React from 'react'

export const BottomBanner: React.FC = () => {
  return (
    <footer className="mt-10 py-4 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-500">
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
        <span>Kamaji Probe • Client-Side Zero-Log Architecture</span>
      </div>

      <div className="flex items-center gap-4 text-[11px]">
        <a
          href="https://github.com/shabane/kamaji"
          target="_blank"
          rel="noreferrer"
          className="hover:text-slate-300 transition-colors"
        >
          GitHub
        </a>
        <a
          href="https://github.com/shabane/kamaji/blob/master/readme.md"
          target="_blank"
          rel="noreferrer"
          className="hover:text-slate-300 transition-colors"
        >
          Docs
        </a>
        <a
          href="https://datatracker.ietf.org/doc/html/rfc6455"
          target="_blank"
          rel="noreferrer"
          className="hover:text-slate-300 transition-colors"
        >
          RFC 6455
        </a>
      </div>
    </footer>
  )
}
