"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";

const Services = () => {
  const [visibleRows, setVisibleRows] = useState<Set<number>>(new Set());
  const [columnsPerRow, setColumnsPerRow] = useState(3);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  const services = [
    { name: "Fade", description: "Jakýkoliv střih od kůže", price: 350 },
    { name: "Klasický střih", description: "Střih do ztracena", price: 250 },
    {
      name: "Dětský střih - fade",
      description: "Děti do 10ti let, střih od kůže",
      price: 250,
    },
    {
      name: "Dětský střih - do ztracena",
      description: "Děti do 10ti let do ztracena",
      price: 200,
    },
    {
      name: "Vousy",
      description: "Úprava vousů pomocí strojku a břitvy.",
      price: 150,
    },
    {
      name: "Mytí vlasů",
      description: "Mytí vlasů - Šampon a kondicionér",
      price: 100,
    },
    {
      name: "Kompletka",
      description: "Střih dle výběru, úprava vousů a obočí , mytí vlasů",
      price: 500,
    },
    {
      name: "Vlasy do ztracena + Vousy",
      description: "Moderní střih do ztracena s precizní úpravou vousů.",
      price: 350,
    },
  ];

  // Detect screen size and set columns
  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth >= 1024) {
        setColumnsPerRow(3); // lg: 3 columns
      } else if (window.innerWidth >= 768) {
        setColumnsPerRow(2); // md: 2 columns
      } else {
        setColumnsPerRow(1); // sm: 1 column
      }
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  // Observe each row individually
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const rowIndex = rowRefs.current.indexOf(
              entry.target as HTMLDivElement
            );
            if (rowIndex !== -1 && !visibleRows.has(rowIndex)) {
              setVisibleRows((prev) => new Set([...prev, rowIndex]));
              observer.unobserve(entry.target);
            }
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: "0px",
      }
    );

    rowRefs.current.forEach((row) => {
      if (row) {
        observer.observe(row);
      }
    });

    return () => {
      rowRefs.current.forEach((row) => {
        if (row) {
          observer.unobserve(row);
        }
      });
    };
  }, [columnsPerRow, visibleRows]);

  const handleServiceClick = (serviceName: string) => {
    // Navigate to booking section with pre-selected service
    const bookingSection = document.getElementById("objednat");
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: "smooth" });

      // Dispatch custom event to pre-select service
      window.dispatchEvent(
        new CustomEvent("preSelectService", {
          detail: { serviceName },
        })
      );
    }
  };

  // Group services by row
  const totalRows = Math.ceil(services.length / columnsPerRow);
  const rows = Array.from({ length: totalRows }, (_, rowIndex) => {
    const start = rowIndex * columnsPerRow;
    const end = start + columnsPerRow;
    return services.slice(start, end);
  });

  return (
    <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Služby
          </h2>
          <p className="text-xl text-gray-600">
            Profesionální péče o vaše vlasy a vousy
          </p>
        </div>

        <div className="space-y-8">
          {rows.map((rowServices, rowIndex) => {
            const isLastRow = rowIndex === rows.length - 1;
            const isIncompleteRow = rowServices.length < columnsPerRow;

            return (
              <div
                key={rowIndex}
                ref={(el) => {
                  if (el) rowRefs.current[rowIndex] = el;
                }}
                className="transition-all duration-500 ease-out"
                style={{
                  opacity: visibleRows.has(rowIndex) ? 1 : 0,
                  transform: visibleRows.has(rowIndex)
                    ? "translateY(0) scale(1)"
                    : "translateY(30px) scale(0.95)",
                }}
              >
                {isLastRow && isIncompleteRow ? (
                  <div className="flex flex-wrap justify-center gap-8">
                    {rowServices.map((service, index) => (
                      <div
                        key={index}
                        className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] max-w-sm"
                      >
                        <Card
                          className="h-full hover:shadow-lg transition-all duration-300 rounded-xl border-0 shadow-md cursor-pointer transform hover:scale-105"
                          onClick={() => handleServiceClick(service.name)}
                        >
                          <CardHeader className="text-center pb-4">
                            <CardTitle className="text-xl text-gray-900">
                              {service.name}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="text-center">
                            <p className="text-gray-600 mb-4">
                              {service.description}
                            </p>
                            <div className="text-2xl font-bold text-blue-600">
                              {service.price} Kč
                            </div>
                            <div className="mt-4">
                              <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                                Klikněte pro objednání
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {rowServices.map((service, index) => (
                      <Card
                        key={index}
                        className="h-full hover:shadow-lg transition-all duration-300 rounded-xl border-0 shadow-md cursor-pointer transform hover:scale-105"
                        onClick={() => handleServiceClick(service.name)}
                      >
                        <CardHeader className="text-center pb-4">
                          <CardTitle className="text-xl text-gray-900">
                            {service.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                          <p className="text-gray-600 mb-4">
                            {service.description}
                          </p>
                          <div className="text-2xl font-bold text-blue-600">
                            {service.price} Kč
                          </div>
                          <div className="mt-4">
                            <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                              Klikněte pro objednání
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
