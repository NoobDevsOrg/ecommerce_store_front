"use client";

import { useState, useRef } from "react";

export default function ImageGallery({ images, name }) {
  const [activeImage, setActiveImage] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({ display: "none" });
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (window.innerWidth < 768) return;

    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;

    setZoomStyle({
      display: "block",
      backgroundPosition: `${x}% ${y}%`,
      backgroundImage: `url(${images[activeImage]})`,
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: "none" });
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-8">
      
      {/* THUMBNAILS: Luxury Vertical Sidebar */}
      <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto no-scrollbar lg:max-h-[600px] shrink-0 pb-4">
        {images.map((img, idx) => (
          <button
            key={idx}
            onMouseEnter={() => setActiveImage(idx)}
            onClick={() => setActiveImage(idx)}
            className={`relative aspect-[4/5] w-20 lg:w-24 rounded-lg overflow-hidden border transition-all duration-500 bg-[#1a1425] ${
              activeImage === idx 
                ? "border-[#b48a3c] shadow-[0_0_15px_rgba(180,138,60,0.3)] scale-105" 
                : "border-stone-800 opacity-50 hover:opacity-100 hover:border-stone-600"
            }`}
          >
            <img 
              src={img} 
              alt={`${name} thumbnail ${idx}`} 
              className="w-full h-full object-cover" 
            />
          </button>
        ))}
      </div>

      {/* MAIN VIEWPORT: Professional Detail Zoom */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative flex-1 aspect-[4/5] bg-[#140f1f] rounded-2xl overflow-hidden border border-stone-800 shadow-2xl cursor-zoom-in group"
      >
        {/* Base Image */}
        <img
          src={images[activeImage]}
          alt={name}
          className={`w-full h-full object-contain p-4 md:p-8 transition-opacity duration-700 ${
            zoomStyle.display === "block" ? "opacity-0" : "opacity-100"
          }`}
        />

        {/* Zoom Layer */}
        <div
          className="absolute inset-0 pointer-events-none bg-no-repeat transition-opacity duration-300"
          style={{
            ...zoomStyle,
            backgroundSize: "280%", 
          }}
        />

        {/* Badge Overlay */}
        <div className="absolute top-8 left-8 pointer-events-none">
          <span className="bg-[#b48a3c]/10 backdrop-blur-md px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] text-[#d4af37] border border-[#b48a3c]/30">
            Enlarged Detail
          </span>
        </div>

        {/* Navigation Arrows (Mobile) */}
        <div className="lg:hidden absolute inset-y-0 left-0 flex items-center pl-4 z-20">
           <button 
            onClick={() => setActiveImage(prev => (prev === 0 ? images.length - 1 : prev - 1))}
            className="bg-black/40 backdrop-blur-md p-4 rounded-full border border-stone-700 text-white active:scale-90 transition-transform"
           >
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="15 18 9 12 15 6"/></svg>
           </button>
        </div>
        <div className="lg:hidden absolute inset-y-0 right-0 flex items-center pr-4 z-20">
           <button 
            onClick={() => setActiveImage(prev => (prev === images.length - 1 ? 0 : prev + 1))}
            className="bg-black/40 backdrop-blur-md p-4 rounded-full border border-stone-700 text-white active:scale-90 transition-transform"
           >
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="9 18 15 12 9 6"/></svg>
           </button>
        </div>

        {/* Mobile Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 lg:hidden">
          {images.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1 rounded-full transition-all duration-500 ${
                activeImage === idx ? "w-8 bg-[#b48a3c]" : "w-2 bg-stone-700"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}