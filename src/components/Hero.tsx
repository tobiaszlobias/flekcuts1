"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const Hero = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState(0);

  const images = [
    "/comb.png",
    "/spray-bottle.png",
    "/clippers.png",
    "/scissors.png",
    "/razor.png",
    "/comb2.png",
  ];

  useEffect(() => {
    let isMounted = true;

    // Preload all images
    const imagePromises = images.map((src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          if (isMounted) {
            setLoadedImages((prev) => prev + 1);
          }
          resolve(src);
        };
        img.onerror = reject;
        img.src = src;
      });
    });

    Promise.all(imagePromises)
      .then(() => {
        if (isMounted) {
          // Small delay to ensure smooth transition
          setTimeout(() => {
            setIsLoading(false);
          }, 300);
        }
      })
      .catch((error) => {
        console.error("Error loading images:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Prevent body scroll during loading
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [isLoading]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  const loadingPercentage = Math.round((loadedImages / images.length) * 100);

  return (
    <>
      {/* Loading Screen */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white touch-none">
          <div className="text-center">
            <div className="mb-4">
              <div className="w-16 h-16 border-4 border-[#3C493F] border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
            <p className="font-crimson text-xl text-gray-700 font-semibold">
              Načítání FlekCuts...
            </p>
            <p className="font-montserrat text-sm text-gray-500 mt-2">
              {loadingPercentage}%
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <section
        id="home"
        className={`relative px-4 sm:px-6 lg:px-8 bg-white py-48 flex items-center justify-center overflow-hidden transition-opacity duration-500 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
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
          className="absolute bottom-80 left-16 sm:bottom-50 sm:left-15 w-16 h-16 sm:w-24 sm:h-24 pointer-events-none opacity-10 sm:opacity-45 will-change-transform"
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
          className="absolute top-60 right-16 w-24 h-22 sm:top-65 sm:right-24 sm:w-32 sm:h-28 pointer-events-none opacity-10 sm:opacity-50 will-change-transform"
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
          <p className="font-montserrat text-xl sm:text-2xl lg:text-3xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
            Ostříhej se u FlekCuts! Moderní střihy pro každého.
          </p>

          {/* Buttons - Small (Subheading / 1.618) */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-400">
            <Button
              onClick={() => scrollToSection("objednat")}
              className="font-crimson bg-[#3C493F] hover:bg-[#3C493F] text-white px-12 py-6 rounded-full text-xl sm:text-2xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-98 transition-all duration-200 relative overflow-hidden group animate-pulse-button cursor-pointer"
            >
              <span className="relative z-10 font-bold">Objednat se</span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-50 animate-shimmer"></span>
            </Button>
            <Button
              onClick={() => scrollToSection("services")}
              variant="outline"
              className="font-montserrat bg-white border-2 border-[#3C493F] text-[#3C493F] hover:bg-white hover:text-[#3C493F] hover:border-[#2d3730] px-12 py-6 rounded-full text-xl sm:text-2xl hover:scale-102 active:scale-99 transition-all duration-200 relative overflow-hidden group cursor-pointer"
            >
              <span className="relative z-10">Zobrazit služby</span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d5ddd9] to-transparent opacity-0 group-hover:opacity-70 animate-shimmer"></span>
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
            animation: shimmer 1.5s ease-in-out infinite;
          }

          .animate-pulse-button {
            animation: pulseButton 2s ease-in-out infinite;
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
