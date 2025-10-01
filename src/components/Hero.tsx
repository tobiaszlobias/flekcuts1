"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const Hero = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      className="relative px-4 sm:px-6 lg:px-8 bg-blue-50 py-48 flex items-center justify-center overflow-hidden"
    >
      {/* Animated Barbershop Tools Background */}

      {/* Comb 1 - Top Right */}
      <div
        className="absolute top-14 right-20 w-36 h-45 pointer-events-none opacity-20"
        style={{
          transform: `translateY(${scrollY * 0.3}px) rotate(${-25 + scrollY * 0.05}deg)`,
          transition: "transform 0.2s ease-out",
        }}
      >
        <img src="/comb.png" alt="" className="w-full h-full object-contain" />
      </div>

      {/* Spray Bottle - Bottom Left */}
      <div
        className="absolute bottom-50 left-12 w-24 h-24 pointer-events-none opacity-18"
        style={{
          transform: `translateY(${scrollY * -0.4}px) rotate(${10 + scrollY * 0.08}deg)`,
          transition: "transform 0.2s ease-out",
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
        className="absolute top-24 left-16 w-36 h-36 pointer-events-none opacity-22"
        style={{
          transform: `translateY(${scrollY * 0.5}px) translateX(${scrollY * 0.1}px) rotate(${15 + scrollY * 0.06}deg)`,
          transition: "transform 0.15s ease-out",
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
        className="absolute top-65 right-24 w-32 h-28 pointer-events-none opacity-20"
        style={{
          transform: `translateY(${-50 + scrollY * 0.35}px) rotate(${-30 + scrollY * 0.07}deg)`,
          transition: "transform 0.18s ease-out",
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
        className="absolute bottom-20 right-16 w-34 h-34 pointer-events-none opacity-18"
        style={{
          transform: `translateY(${scrollY * -0.45}px) translateX(${scrollY * -0.08}px) rotate(${60 + scrollY * 0.04}deg)`,
          transition: "transform 0.2s ease-out",
        }}
      >
        <img src="/razor.png" alt="" className="w-full h-full object-contain" />
      </div>

      {/* Small Comb 2 - Middle Left */}
      <div
        className="absolute top-2/3 left-24 w-32 h-32 pointer-events-none opacity-15"
        style={{
          transform: `translateY(${scrollY * 0.25}px) rotate(${-45 + scrollY * 0.09}deg)`,
          transition: "transform 0.22s ease-out",
        }}
      >
        <img src="/comb2.png" alt="" className="w-full h-full object-contain" />
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
  );
};

export default Hero;
