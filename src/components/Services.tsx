import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const Services = () => {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  type ServiceCard = {
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    preselectServiceName?: string;
  };

  // Scroll animation observer for entire section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            setIsSectionVisible(true);
          }
        });
      },
      {
        threshold: [0, 0.3, 0.5],
        rootMargin: '-100px 0px 0px 0px'
      }
    );

    const node = sectionRef.current;
    if (node) observer.observe(node);

    return () => {
      if (node) observer.unobserve(node);
    };
  }, []);

  const featuredServices: ServiceCard[] = [
    {
      name: "Fade",
      description: "Precizní přechody od nuly s dokonalým vyblednutím",
      price: 350,
      imageUrl: "/fade.png",
      preselectServiceName: "Fade",
    },
    {
      name: "Klasický střih",
      description: "Elegantní střih s plynulými přechody do ztracena",
      price: 250,
      imageUrl: "/klasicky.jpg",
      preselectServiceName: "Klasický střih",
    },
  ];

  const otherServices: ServiceCard[] = [
    {
      name: "Dětský střih",
      description: "Speciální péče pro děti do 10 let v příjemném prostředí",
      price: 250,
      preselectServiceName: "Dětský střih - klasický",
    },
    {
      name: "Vousy",
      description: "Profesionální úprava a konturování vousů břitvou",
      price: 150,
      preselectServiceName: "Vousy",
    },
    {
      name: "Mytí vlasů",
      description: "Relaxační mytí s kvalitním šamponem a kondicionérem",
      price: 100,
      preselectServiceName: "Mytí vlasů",
    },
    {
      name: "Kompletka",
      description: "Kompletní péče - střih, vousy, obočí a mytí vlasů",
      price: 500,
      preselectServiceName: "Kompletka",
    },
  ];

  useEffect(() => {
    const items = itemRefs.current.slice();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const itemIndex = items.indexOf(entry.target as HTMLDivElement);
            if (itemIndex !== -1) {
              setVisibleItems((prev) => {
                if (prev.has(itemIndex)) return prev;
                const next = new Set(prev);
                next.add(itemIndex);
                return next;
              });
              observer.unobserve(entry.target);
            }
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    items.forEach((item) => {
      if (item) {
        observer.observe(item);
      }
    });

    return () => {
      items.forEach((item) => {
        if (item) {
          observer.unobserve(item);
        }
      });
    };
  }, []);

  const handleServiceClick = (serviceName: string) => {
    // Dispatch event first
    window.dispatchEvent(
      new CustomEvent("preSelectService", {
        detail: { serviceName },
      })
    );

    // Scroll to booking section immediately
    const bookingElement = document.getElementById("objednat");
    if (bookingElement) {
      const targetPosition = bookingElement.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section
      ref={sectionRef}
      id="services"
      className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white"
    >
      <div className="max-w-6xl mx-auto">
        <div
          className="text-center mb-12 sm:mb-16"
          style={{
            opacity: isSectionVisible ? 1 : 0,
            transform: isSectionVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.4s ease-out 0.1s, transform 0.4s ease-out 0.1s',
            visibility: isSectionVisible ? 'visible' : 'hidden'
          }}
        >
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
                opacity: visibleItems.has(index) ? 1 : 0,
                transform: visibleItems.has(index) ? "translateY(0)" : "translateY(30px)",
                transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
                visibility: visibleItems.has(index) ? 'visible' : 'hidden'
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
                <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B35]/0 via-[#FF6B35]/20 to-[#FF6B35]/0 shimmer-effect z-10 pointer-events-none"></div>
                <style>{`
                  @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                  }
                  .shimmer-effect {
                    transform: translateX(-100%);
                  }
                  div:hover > .shimmer-effect {
                    animation: shimmer 1.4s ease-out;
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
	                  <div className="relative w-full h-48 md:w-1/2 md:h-80 overflow-hidden bg-custom-orange">
	                    {service.imageUrl ? (
	                      <Image
	                        src={service.imageUrl}
	                        alt={service.name}
	                        fill
	                        sizes="(max-width: 768px) 100vw, 50vw"
	                        className="object-contain"
	                        priority={index === 0}
	                      />
	                    ) : null}
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
                  opacity: visibleItems.has(actualIndex) ? 1 : 0,
                  transform: visibleItems.has(actualIndex) ? "translateY(0)" : "translateY(30px)",
                  transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
                  visibility: visibleItems.has(actualIndex) ? 'visible' : 'hidden'
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleServiceClick(service.preselectServiceName || service.name);
                }}
              >
                <div
                  className="bg-white rounded-xl shadow-md transition-all duration-300 p-5 h-full group relative overflow-hidden active:scale-95 flex flex-col"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-[#FF6B35]/25 rounded-full blur-2xl group-hover:w-32 group-hover:h-32 transition-all duration-500 -translate-y-10 translate-x-10"></div>
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
