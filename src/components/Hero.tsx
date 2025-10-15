"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { smoothScrollTo } from "@/utils/smoothScroll";

const Hero = () => {
  const [scrollY, setScrollY] = useState(0);

  const images = [
    "/comb.png",
    "/spray-bottle.png",
    "/clippers.png",
    "/scissors.png",
    "/razor.png",
    "/comb2.png",
  ];

  useEffect(() => {
    // Preload images in background without blocking UI
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    smoothScrollTo(sectionId, 80); // 80px offset for navbar
  };

  return (
    <>
      {/* Main Content */}
      <section
        id="home"
        className="relative px-4 sm:px-6 lg:px-8 bg-white py-48 flex items-center justify-center overflow-hidden"
      >
        {/* Animated Barbershop Tools Background */}

        {/* Comb 1 - Top Right */}
        <div
          className="absolute top-14 right-20 w-24 h-32 sm:w-36 sm:h-45 pointer-events-none opacity-10 sm:opacity-50 will-change-transform"
          style={{
            transform: `translate3d(0, ${scrollY * 0.2}px, 0) rotate(${-25 + scrollY * 0.03}deg)`,
          }}
        >
          <img
            src="/comb.png"
            alt=""
            className="w-full h-full object-contain"
          />
        </div>

        {/* Spray Bottle - Bottom Left */}
        <div
          className="absolute bottom-[26rem] left-16 sm:bottom-72 sm:left-15 w-16 h-16 sm:w-24 sm:h-24 pointer-events-none opacity-10 sm:opacity-45 will-change-transform"
          style={{
            transform: `translate3d(0, ${scrollY * -0.25}px, 0) rotate(${10 + scrollY * 0.05}deg)`,
          }}
        >
          <img
            src="/spray-bottle.png"
            alt=""
            className="w-full h-full object-contain"
          />
        </div>

        {/* Clippers - Top Left */}
        <div
          className="absolute top-16 left-8 w-24 h-24 sm:top-20 sm:left-20 sm:w-36 sm:h-36 pointer-events-none opacity-12 sm:opacity-55 will-change-transform"
          style={{
            transform: `translate3d(${scrollY * 0.07}px, ${scrollY * 0.3}px, 0) rotate(${15 + scrollY * 0.04}deg)`,
          }}
        >
          <img
            src="/clippers.png"
            alt=""
            className="w-full h-full object-contain"
          />
        </div>

        {/* Scissors - Middle Right */}
        <div
          className="absolute top-56 right-12 w-24 h-22 sm:top-96 sm:right-16 sm:w-32 sm:h-28 pointer-events-none opacity-10 sm:opacity-50 will-change-transform"
          style={{
            transform: `translate3d(0, ${-50 + scrollY * 0.22}px, 0) rotate(${-30 + scrollY * 0.04}deg)`,
          }}
        >
          <img
            src="/scissors.png"
            alt=""
            className="w-full h-full object-contain"
          />
        </div>

        {/* Razor - Bottom Right */}
        <div
          className="absolute bottom-20 right-16 w-26 h-26 sm:right-16 sm:w-34 sm:h-34 pointer-events-none opacity-10 sm:opacity-45 will-change-transform"
          style={{
            transform: `translate3d(${scrollY * -0.05}px, ${scrollY * -0.28}px, 0) rotate(${60 + scrollY * 0.03}deg)`,
          }}
        >
          <img
            src="/razor.png"
            alt=""
            className="w-full h-full object-contain"
          />
        </div>

        {/* Small Comb 2 - Middle Left */}
        <div
          className="absolute top-3/4 left-12 w-32 h-32 sm:top-2/3 sm:left-24 sm:w-40 sm:h-40 pointer-events-none opacity-8 sm:opacity-40 will-change-transform"
          style={{
            transform: `translate3d(0, ${scrollY * 0.18}px, 0) rotate(${-45 + scrollY * 0.05}deg)`,
          }}
        >
          <img
            src="/comb2.png"
            alt=""
            className="w-full h-full object-contain"
          />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          {/* Main Heading - Largest (Golden Ratio Base) */}
          <h1 className="font-crimson font-extrabold italic text-6xl sm:text-7xl lg:text-8xl xl:text-9xl text-gray-900 mb-6 leading-tight animate-fade-in-up">
            Zase to přerostlo?
          </h1>

          {/* Subheading - Medium (Base / 2.618) */}
          <p className="font-montserrat text-xl sm:text-2xl lg:text-3xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
            Ostříhej se u FlekCuts! Moderní střihy pro každého.
          </p>

          {/* Buttons - Small (Subheading / 1.618) */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-400">
            <Button
              onClick={() => scrollToSection("objednat")}
              className="font-montserrat bg-[#FF6B35] hover:!bg-[#FF6B35] text-white !border-none px-12 rounded-full text-xl sm:text-2xl hover:scale-105 active:scale-99 transition-all duration-200 relative overflow-visible group cursor-pointer min-w-[240px] sm:min-w-[280px] h-[60px] sm:h-[64px] flex items-center justify-center shadow-none outline-none focus:outline-none focus-visible:ring-0"
            >
              <span className="absolute inset-[-3px] rounded-full animate-border-rotate" style={{ background: 'conic-gradient(from 0deg, transparent 0deg, transparent 340deg, rgba(255, 255, 255, 0.9) 350deg, rgba(255, 255, 255, 0) 360deg)' }}></span>
              <span className="absolute inset-0 bg-[#FF6B35] rounded-full"></span>
              <span className="relative z-10">Objednat se</span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 group-hover:opacity-70 animate-shimmer z-[5]"></span>
            </Button>
            <Button
              onClick={() => scrollToSection("services")}
              variant="outline"
              className="font-montserrat bg-white border-2 border-[#FF6B35] text-[#FF6B35] hover:bg-white hover:text-[#E5572C] hover:border-[#E5572C] px-12 rounded-full text-xl sm:text-2xl hover:scale-102 active:scale-99 transition-all duration-200 relative overflow-hidden group cursor-pointer min-w-[240px] sm:min-w-[280px] h-[60px] sm:h-[64px] flex items-center justify-center"
            >
              <span className="relative z-10">Zobrazit služby</span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFE5DC] to-transparent opacity-0 group-hover:opacity-70 animate-shimmer"></span>
            </Button>
          </div>
        </div>

        {/* CSS Animations */}
        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }

          @keyframes borderRotate {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }

          @keyframes pulseButton {
            0%,
            100% {
              box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7);
            }
            50% {
              box-shadow: 0 0 0 10px rgba(37, 99, 235, 0);
            }
          }

          .animate-fade-in-up {
            animation: fadeInUp 0.8s ease-out forwards;
          }

          .animate-shimmer {
            animation: shimmer 4s ease-in-out infinite;
          }

          .animate-border-rotate {
            animation: borderRotate 6s linear infinite;
            pointer-events: none;
          }

          .animate-pulse-button {
            animation: pulseButton 2s ease-in-out infinite;
          }

          .group:hover .animate-shimmer {
            animation: shimmer 1.5s ease-in-out infinite;
          }

          .group:hover .animate-border-rotate {
            animation: borderRotate 2s linear infinite;
          }

          .animation-delay-200 {
            animation-delay: 0.2s;
            opacity: 0;
          }

          .animation-delay-400 {
            animation-delay: 0.4s;
            opacity: 0;
          }
        `}</style>
      </section>
    </>
  );
};

export default Hero;
