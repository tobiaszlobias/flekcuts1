
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const Services = () => {

  const services = [
    { name: "Fade", description: "Jakýkoliv střih od kůže", price: 350 },
    { name: "Klasický střih", description: "Střih do ztracena", price: 250 },
    { name: "Dětský střih - fade", description: "Děti do 10ti let, střih od kůže", price: 250 },
    { name: "Dětský střih - do ztracena", description: "Děti do 10ti let do ztracena", price: 200 },
    { name: "Vousy", description: "Úprava vousů pomocí strojku a břitvy.", price: 150 },
    { name: "Mytí vlasů", description: "Mytí vlasů - Šampon a kondicionér", price: 100 },
    { name: "Kompletka", description: "Střih dle výběru, úprava vousů a obočí , mytí vlasů", price: 500 },
    { name: "Vlasy do ztracena + Vousy", description: "", price: 350 },
  ];

  return (
    <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Služby</h2>
          <p className="text-xl text-gray-600">Profesionální péče o vaše vlasy a vousy</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow duration-300 rounded-xl border-0 shadow-md"
            >
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl text-gray-900">{service.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">{service.description}</p>
                <div className="text-2xl font-bold text-blue-600 mt-2">{service.price} Kč</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
