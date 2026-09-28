import React from 'react'

export default function Logo({
  className = 'w-7 h-5',
  textClassName = 'text-xl',
  isDark = false
}) {
  const primarySlash = isDark ? '#ffffff' : '#023e73'
  const textColor = isDark ? 'text-white' : 'text-slate-900'

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Modern geometric cinema emblem */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          viewBox="0 0 34 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${className} drop-shadow-sm`}
        >
          {/* Left angled slash */}
          <path
            d="M2 21L12 3H17L7 21H2Z"
            fill={primarySlash}
          />
          {/* Right angled slash in bright cinema accent */}
          <path
            d="M11 21L21 3H31L16 21H11Z"
            fill="#007bff"
          />
        </svg>
      </div>

      {/* Brand Name: VS Cinemas */}
      <span className={`font-bold tracking-tight ${textColor} flex items-center gap-1.5 ${textClassName}`}>
        <span className="text-[#007bff] font-black">VS</span>
        <span className="font-semibold">Cinemas</span>
      </span>
    </div>
  )
}
