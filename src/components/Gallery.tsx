import React, { useRef, useEffect, useState } from "react";

const Gallery = () => {
  // Replace these with your actual image paths
  const images = [
    "/haircut1.jpg",
    "/haircut2.jpg",
    "/haircut3.jpg",
    "/haircut4.jpg",
    "/haircut5.jpg",
    "/haircut6.jpg",
    "/haircut7.jpg",
    "/haircut8.jpg",
    "/haircut9.jpg",
  ];

  // Triple the images for seamless infinite scroll
  const allImages = [...images, ...images, ...images];

  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isSlowed, setIsSlowed] = useState(false);
  const animationRef = useRef<number | null>(null);
  const positionRef = useRef(0);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    // Calculate total width based on screen size
    const getCardWidth = () => {
      if (window.innerWidth >= 1024) return 384 + 24; // lg: w-96 + gap-6
      if (window.innerWidth >= 640) return 320 + 16; // sm: w-80 + gap-4
      return 192 + 12; // mobile: w-48 + gap-3
    };

    const totalWidth = getCardWidth() * 7; // 7 images in one set

    const animate = (currentTime: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = currentTime;
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      if (!isPaused) {
        // Speed: normal is ~30s for full cycle, slowed is ~90s
        const speed = isSlowed ? totalWidth / 90000 : totalWidth / 30000;
        positionRef.current += speed * deltaTime;

        // Reset position for infinite loop
        if (positionRef.current >= totalWidth) {
          positionRef.current -= totalWidth;
        }

        element.style.transform = `translateX(-${positionRef.current}px)`;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused, isSlowed]);

  const handleMouseEnter = () => {
    if (window.matchMedia("(hover: hover)").matches) {
      setIsSlowed(true);
    }
  };

  const handleMouseLeave = () => {
    setIsSlowed(false);
    setIsPaused(false);
  };

  const handleMouseDown = () => {
    setIsPaused(true);
  };

  const handleMouseUp = () => {
    setIsPaused(false);
  };

  const handleTouchStart = () => {
    setIsPaused(true);
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
  };

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto mb-8 sm:mb-12 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
          Moje Práce
        </h2>
        <p className="text-lg sm:text-xl text-gray-600">
          Podívejte se na moje nejnovější střihy
        </p>
      </div>

      {/* Scrolling Gallery Container */}
      <div
        className="relative overflow-hidden py-4"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Gradient Overlays for fade effect - narrower on mobile */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none"></div>

        {/* Scrolling Images */}
        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 lg:gap-6"
          style={{ willChange: "transform" }}
        >
          {allImages.map((image, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-48 h-48 sm:w-80 sm:h-64 lg:w-96 lg:h-80 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg select-none"
            >
              <img
                src={image}
                alt={`Střih ${(index % images.length) + 1}`}
                className="w-full h-full object-cover"
                draggable="false"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
