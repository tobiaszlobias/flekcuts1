import { useEffect, useRef, useState } from "react";
import { smoothScrollTo } from "@/utils/smoothScroll";

const Services = () => {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  const featuredServices = [
    {
      name: "Fade",
      description: "Precizní přechody od nuly s dokonalým vyblednutím",
      price: 350,
      imageUrl: "/fade.jpg",
    },
    {
      name: "Klasický střih",
      description: "Elegantní střih s plynulými přechody do ztracena",
      price: 250,
      imageUrl: "/klasicky.jpg",
    },
  ];

  const otherServices = [
    {
      name: "Dětský střih",
      description: "Speciální péče pro děti do 10 let v příjemném prostředí",
      price: 250,
    },
    {
      name: "Vousy",
      description: "Profesionální úprava a konturování vousů břitvou",
      price: 150,
    },
    {
      name: "Mytí vlasů",
      description: "Relaxační mytí s kvalitním šamponem a kondicionérem",
      price: 100,
    },
    {
      name: "Kompletka",
      description: "Kompletní péče - střih, vousy, obočí a mytí vlasů",
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
        threshold: 0.1,
        rootMargin: "100px 0px 100px 0px",
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
    console.log("Service clicked IMMEDIATELY:", serviceName, Date.now()); // Debug log with timestamp

    // Dispatch event first
    window.dispatchEvent(
      new CustomEvent("preSelectService", {
        detail: { serviceName },
      })
    );

    // Test with instant scroll to see if the delay is in the scroll function
    const bookingElement = document.getElementById("objednat");
    if (bookingElement) {
      console.log("Starting scroll NOW:", Date.now());
      // Use instant scroll for testing
      const targetPosition = bookingElement.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section
      id="services"
      className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-crimson italic text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Služby
          </h2>
          <p className="font-montserrat text-lg sm:text-xl lg:text-2xl text-gray-600">
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
              className="cursor-pointer"
              style={{
                opacity: 1,
                transform: visibleItems.has(index)
                  ? "translateY(0)"
                  : "translateY(20px)",
                transition: visibleItems.has(index) ? 'none' : 'transform 0.7s ease-out',
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleServiceClick(service.name);
              }}
            >
              <div
                className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 relative active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B35]/0 via-[#FF6B35]/10 to-[#FF6B35]/0 shimmer-effect z-10 pointer-events-none"></div>
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
                    <h3 className="font-crimson italic text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                      {service.name}
                    </h3>
                    <p className="font-montserrat text-lg sm:text-xl text-gray-600 mb-4">
                      {service.description}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="font-montserrat text-4xl sm:text-5xl font-bold text-[#FF6B35]">
                        {service.price} Kč
                      </span>
                      <span className="font-montserrat bg-[#FF6B35]/10 text-[#FF6B35] text-base px-5 py-2 rounded-full font-medium">
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
                className="cursor-pointer"
                style={{
                  opacity: 1,
                  transform: visibleItems.has(actualIndex)
                    ? "translateY(0)"
                    : "translateY(20px)",
                  transition: visibleItems.has(actualIndex) ? 'none' : 'transform 0.7s ease-out',
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleServiceClick(service.name);
                }}
              >
                <div
                  className="bg-white rounded-xl shadow-md transition-all duration-300 p-5 h-full group relative overflow-hidden active:scale-95 flex flex-col"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-[#FF6B35]/15 rounded-full blur-2xl group-hover:w-32 group-hover:h-32 transition-all duration-500 -translate-y-10 translate-x-10"></div>
                  <h3 className="font-crimson italic text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    {service.name}
                  </h3>
                  <p className="font-montserrat text-base text-gray-600 mb-3 flex-grow">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="font-montserrat text-3xl font-bold text-[#FF6B35]">
                      {service.price} Kč
                    </span>
                    <span className="font-crimson italic text-[#FF6B35] text-2xl font-medium">
                      →
                    </span>
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
