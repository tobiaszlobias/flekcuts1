
"use client";

import { Button } from "@/components/ui/button";

const Hero = () => {
  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative px-4 sm:px-6 lg:px-8 bg-blue-50 py-48 flex items-center justify-center">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
          Zase to přerostlo?
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Ostříhej se u FlekCuts! Moderní střihy pro každého.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => scrollToSection('objednat')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg"
          >
            Objednat se
          </Button>
          <Button
            onClick={() => scrollToSection('services')}
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
