"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const Hero = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

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
    // Check if mobile on mount
    setIsMobile(window.innerWidth < 640);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      {/* Main Content */}
      <section
        id="home"
        className="relative px-4 sm:px-6 lg:px-8 bg-white py-48 flex items-center justify-center overflow-hidden"
      >
        {/* Gradient Fade at Bottom - to smoothly hide parallax effect */}
        <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-t from-white to-transparent z-20 pointer-events-none"></div>

        {/* Animated Barbershop Tools Background */}

        {/* Comb 1 - Top Right */}
        <div
          className="absolute top-20 sm:top-16 right-12 w-36 h-48 sm:w-56 sm:h-72 pointer-events-none opacity-15 sm:opacity-60 will-change-transform"
          style={{
            transform: `translate3d(0, ${scrollY * (isMobile ? 0.2 : 0.4)}px, 0) rotate(${-5 + scrollY * (isMobile ? 0.03 : 0.06)}deg)`,
            backfaceVisibility: "hidden",
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
          className="absolute bottom-[22rem] left-16 sm:bottom-[240px] sm:left-[110px] w-24 h-24 sm:w-36 sm:h-36 pointer-events-none opacity-15 sm:opacity-55 will-change-transform"
          style={{
            transform: `translate3d(0, ${scrollY * (isMobile ? -0.25 : -0.5)}px, 0) rotate(${10 + scrollY * (isMobile ? 0.05 : 0.1)}deg)`,
            backfaceVisibility: "hidden",
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
          className="absolute top-36 left-8 w-36 h-36 sm:top-20 sm:left-20 sm:w-56 sm:h-56 pointer-events-none opacity-18 sm:opacity-65 will-change-transform"
          style={{
            transform: `translate3d(${scrollY * (isMobile ? 0.07 : 0.14)}px, ${scrollY * (isMobile ? 0.3 : 0.6)}px, 0) rotate(${15 + scrollY * (isMobile ? 0.04 : 0.08)}deg)`,
            backfaceVisibility: "hidden",
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
          className="absolute top-80 right-12 w-36 h-32 sm:top-96 sm:right-16 sm:w-48 sm:h-42 pointer-events-none opacity-15 sm:opacity-60 will-change-transform"
          style={{
            transform: `translate3d(0, ${-50 + scrollY * (isMobile ? 0.22 : 0.44)}px, 0) rotate(${-30 + scrollY * (isMobile ? 0.04 : 0.08)}deg)`,
            backfaceVisibility: "hidden",
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
          className="absolute bottom-44 right-8 w-40 h-40 sm:bottom-[30px] sm:right-[140px] sm:w-52 sm:h-52 pointer-events-none opacity-15 sm:opacity-55 will-change-transform"
          style={{
            transform: `translate3d(${scrollY * (isMobile ? -0.05 : -0.1)}px, ${scrollY * (isMobile ? -0.28 : -0.56)}px, 0) rotate(${60 + scrollY * (isMobile ? 0.03 : 0.06)}deg)`,
            backfaceVisibility: "hidden",
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
          className="absolute top-[68%] left-12 w-48 h-48 sm:top-[70%] sm:left-[120px] sm:w-60 sm:h-60 pointer-events-none opacity-12 sm:opacity-50 will-change-transform"
          style={{
            transform: `translate3d(0, ${scrollY * (isMobile ? 0.18 : 0.36)}px, 0) rotate(${-45 + scrollY * (isMobile ? 0.05 : 0.1)}deg)`,
            backfaceVisibility: "hidden",
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
            <button
              onClick={() => scrollToSection("objednat")}
              className="font-montserrat bg-[#FF6B35] text-white px-8 py-3 rounded-full hover:bg-[#FF6B35] transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 cursor-pointer relative overflow-hidden group text-xl sm:text-2xl min-w-[240px] sm:min-w-[280px]"
            >
              <span className="relative z-10 font-semibold">
                Objednat se
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 group-hover:opacity-70 animate-shimmer z-[5]"></span>
            </button>
            <button
              onClick={() => scrollToSection("services")}
              className="font-montserrat bg-white border-2 border-[#FF6B35] text-[#FF6B35] hover:bg-white hover:text-[#E5572C] hover:border-[#E5572C] px-8 py-3 rounded-full transition-all duration-300 hover:scale-102 active:scale-95 cursor-pointer relative overflow-hidden group text-xl sm:text-2xl min-w-[240px] sm:min-w-[280px]"
            >
              <span className="relative z-10 font-semibold">
                Zobrazit služby
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFE5DC] to-transparent opacity-0 group-hover:opacity-70 animate-shimmer"></span>
            </button>
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
