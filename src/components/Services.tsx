import { useEffect, useRef, useState } from "react";

const Services = () => {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const featuredServices = [
    {
      name: "Fade",
      description: "Jakýkoliv střih od kůže",
      price: 350,
      imageUrl: "/fade.jpg",
    },
    {
      name: "Klasický střih",
      description: "Střih do ztracena",
      price: 250,
      imageUrl: "/klasicky.jpg",
    },
  ];

  const otherServices = [
    {
      name: "Dětský střih",
      description: "Děti do 10ti let",
      price: 250,
    },
    {
      name: "Vousy",
      description: "Úprava vousů pomocí strojku a břitvy",
      price: 150,
    },
    {
      name: "Mytí vlasů",
      description: "Mytí vlasů - šampon a kondicionér",
      price: 100,
    },
    {
      name: "Kompletka",
      description: "Střih dle výběru, úprava vousů a obočí, mytí vlasů",
      price: 500,
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const itemIndex = itemRefs.current.indexOf(
              entry.target as HTMLDivElement
            );
            if (itemIndex !== -1 && !visibleItems.has(itemIndex)) {
              setVisibleItems((prev) => new Set([...prev, itemIndex]));
              observer.unobserve(entry.target);
            }
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    itemRefs.current.forEach((item) => {
      if (item) {
        observer.observe(item);
      }
    });

    return () => {
      itemRefs.current.forEach((item) => {
        if (item) {
          observer.unobserve(item);
        }
      });
    };
  }, [visibleItems]);

  const handleServiceClick = (serviceName: string) => {
    const bookingSection = document.getElementById("objednat");
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: "smooth" });

      window.dispatchEvent(
        new CustomEvent("preSelectService", {
          detail: { serviceName },
        })
      );
    }
  };

  return (
    <section
      id="services"
      className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Služby
          </h2>
          <p className="text-lg sm:text-xl text-gray-600">
            Profesionální péče o vaše vlasy a vousy
          </p>
        </div>

        {/* Featured Services with Images */}
        <div className="space-y-6 mb-12 sm:mb-16">
          {featuredServices.map((service, index) => (
            <div
              key={index}
              ref={(el) => {
                if (el) itemRefs.current[index] = el;
              }}
              className="transition-all duration-700 ease-out"
              style={{
                opacity: visibleItems.has(index) ? 1 : 0,
                transform: visibleItems.has(index)
                  ? "translateY(0)"
                  : "translateY(30px)",
                transitionDelay: `${index * 150}ms`,
              }}
            >
              <div
                className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 cursor-pointer relative active:scale-95"
                onClick={() => handleServiceClick(service.name)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 shimmer-effect z-10 pointer-events-none"></div>
                <style>{`
                  @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                  }
                  .shimmer-effect {
                    transform: translateX(-100%);
                  }
                  div:hover > .shimmer-effect {
                    animation: shimmer 0.7s ease-out;
                  }
                `}</style>
                <div className="flex flex-col md:flex-row relative">
                  {/* Text Content */}
                  <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center">
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                      {service.name}
                    </h3>
                    <p className="text-base sm:text-lg text-gray-600 mb-4">
                      {service.description}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="text-3xl sm:text-4xl font-bold text-blue-600">
                        {service.price} Kč
                      </span>
                      <span className="bg-blue-100 text-blue-800 text-sm px-4 py-2 rounded-full font-medium">
                        Objednat
                      </span>
                    </div>
                  </div>

                  {/* Image */}
                  <div className="w-full md:w-2/5 h-48 md:h-auto overflow-hidden">
                    <img
                      src={service.imageUrl}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Other Services - Compact Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {otherServices.map((service, index) => {
            const actualIndex = featuredServices.length + index;
            return (
              <div
                key={index}
                ref={(el) => {
                  if (el) itemRefs.current[actualIndex] = el;
                }}
                className="transition-all duration-700 ease-out"
                style={{
                  opacity: visibleItems.has(actualIndex) ? 1 : 0,
                  transform: visibleItems.has(actualIndex)
                    ? "translateY(0)"
                    : "translateY(30px)",
                  transitionDelay: `${actualIndex * 100}ms`,
                }}
              >
                <div
                  className="bg-white rounded-xl shadow-md transition-all duration-300 cursor-pointer p-5 h-full group relative overflow-hidden active:scale-95"
                  onClick={() => handleServiceClick(service.name)}
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl group-hover:w-32 group-hover:h-32 transition-all duration-500 -translate-y-10 translate-x-10"></div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                    {service.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">
                      {service.price} Kč
                    </span>
                    <span className="text-blue-600 text-xl font-medium">→</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
