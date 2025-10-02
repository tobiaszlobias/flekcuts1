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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-50 touch-none">
          <div className="text-center">
            <div className="mb-4">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
            <p className="text-xl text-gray-700 font-semibold">
              Načítání FlekCuts...
            </p>
            <p className="text-sm text-gray-500 mt-2">{loadingPercentage}%</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <section
        id="home"
        className={`relative px-4 sm:px-6 lg:px-8 bg-blue-50 py-48 flex items-center justify-center overflow-hidden transition-opacity duration-500 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
      >
        {/* Animated Barbershop Tools Background */}

        {/* Comb 1 - Top Right */}
        <div
          className="absolute top-14 right-20 w-24 h-32 sm:w-36 sm:h-45 pointer-events-none opacity-20 will-change-transform"
          style={{
            transform: `translate3d(0, ${scrollY * 0.3}px, 0) rotate(${-25 + scrollY * 0.05}deg)`,
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
          className="absolute bottom-50 left-8 w-16 h-16 sm:left-15 sm:w-24 sm:h-24 pointer-events-none opacity-18 will-change-transform"
          style={{
            transform: `translate3d(0, ${scrollY * -0.4}px, 0) rotate(${10 + scrollY * 0.08}deg)`,
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
          className="absolute top-20 left-8 w-24 h-24 sm:left-20 sm:w-36 sm:h-36 pointer-events-none opacity-22 will-change-transform"
          style={{
            transform: `translate3d(${scrollY * 0.1}px, ${scrollY * 0.5}px, 0) rotate(${15 + scrollY * 0.06}deg)`,
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
          className="absolute top-65 right-16 w-20 h-18 sm:right-24 sm:w-32 sm:h-28 pointer-events-none opacity-20 will-change-transform"
          style={{
            transform: `translate3d(0, ${-50 + scrollY * 0.35}px, 0) rotate(${-30 + scrollY * 0.07}deg)`,
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
          className="absolute bottom-20 right-10 w-22 h-22 sm:right-16 sm:w-34 sm:h-34 pointer-events-none opacity-18 will-change-transform"
          style={{
            transform: `translate3d(${scrollY * -0.08}px, ${scrollY * -0.45}px, 0) rotate(${60 + scrollY * 0.04}deg)`,
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
          className="absolute top-2/3 left-12 w-28 h-28 sm:left-24 sm:w-40 sm:h-40 pointer-events-none opacity-15 will-change-transform"
          style={{
            transform: `translate3d(0, ${scrollY * 0.25}px, 0) rotate(${-45 + scrollY * 0.09}deg)`,
          }}
        >
          <img
            src="/comb2.png"
            alt=""
            className="w-full h-full object-contain"
          />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Zase to přerostlo?
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Ostříhej se u FlekCuts! Moderní střihy pro každého.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => scrollToSection("objednat")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg"
            >
              Objednat se
            </Button>
            <Button
              onClick={() => scrollToSection("services")}
              variant="outline"
              className="bg-white border-blue-600 text-blue-600 hover:bg-blue-100 px-8 py-3 rounded-full text-lg"
            >
              Zobrazit služby
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
