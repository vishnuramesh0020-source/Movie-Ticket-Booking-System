import React from 'react'
import bgImage from '../assets/astro-cinemas-bg.jpg'

export default function AstroAuthLayout({ title, subtitle = 'Best Online Ticketing System In Town', children }) {
  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-950 select-none overflow-x-hidden">
      {/* Main Container using the vintage projector + yellow beam background */}
      <div
        className="flex-1 w-full relative flex items-center justify-center min-h-screen bg-slate-900"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Subtle mobile readability backdrop overlay */}
        <div className="absolute inset-0 bg-black/40 md:bg-transparent pointer-events-none" />

        {/* Content Container aligned directly over the background image features */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-10 lg:px-16 py-8 sm:py-12 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center min-h-[520px]">
          {/* Left Column: Heading moved up and enlarged */}
          <div className="md:col-span-5 flex flex-col items-center justify-center text-center pb-4 md:pb-24 lg:pb-32 -translate-y-2 md:-translate-y-8 md:pl-2">
            <h1
              style={{ fontFamily: "'Poppins', 'Montserrat', sans-serif" }}
              className="text-3xl sm:text-[44px] md:text-[54px] lg:text-[58px] font-normal text-white tracking-normal leading-tight text-center select-none drop-shadow-md"
            >
              {title}
            </h1>
            <p
              style={{ fontFamily: "'Poppins', 'Montserrat', sans-serif" }}
              className="text-xs sm:text-[15px] md:text-[17px] text-white/95 font-normal tracking-wide mt-2 sm:mt-3 text-center select-none drop-shadow-xs"
            >
              {subtitle}
            </p>
          </div>

          {/* Right Column: Form placed directly within the yellow projection cone */}
          <div className="md:col-span-7 flex justify-center md:justify-end md:pr-6 lg:pr-16">
            <div className="w-full max-w-[340px] sm:max-w-[360px]">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
