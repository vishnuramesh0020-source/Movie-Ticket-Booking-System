import React from 'react'

export default function Logo({ className = 'w-7 h-5', textClassName = 'text-xl' }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Modern geometric cinema emblem */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          viewBox="0 0 34 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${className} text-white drop-shadow-sm`}
        >
          {/* Left angled slash */}
          <path
            d="M2 21L12 3H17L7 21H2Z"
            fill="#ffffff"
          />
          {/* Right angled slash in bright cinema accent */}
          <path
            d="M11 21L21 3H31L16 21H11Z"
            fill="#38bdf8"
          />
        </svg>
      </div>

      {/* Brand Name: VS Cinemas */}
      <span className={`font-bold tracking-tight text-white flex items-center gap-1.5 ${textClassName}`}>
        <span className="text-[#38bdf8] font-black">VS</span>
        <span className="font-semibold text-white">Cinemas</span>
      </span>
    </div>
  )
}
