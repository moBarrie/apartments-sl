import Link from "next/image";
import Image from "next/image";

const cities = [
  {
    name: "Freetown",
    image: "https://via.placeholder.com/400x300/0284c7/ffffff?text=Freetown",
    properties: 245,
  },
  {
    name: "Bo",
    image: "https://via.placeholder.com/400x300/059669/ffffff?text=Bo",
    properties: 87,
  },
  {
    name: "Kenema",
    image: "https://via.placeholder.com/400x300/eab308/ffffff?text=Kenema",
    properties: 64,
  },
  {
    name: "Makeni",
    image: "https://via.placeholder.com/400x300/0369a1/ffffff?text=Makeni",
    properties: 52,
  },
];

export default function PopularCities() {
  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Explore Popular Cities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cities.map((city) => (
            <a
              key={city.name}
              href={`/apartments?city=${city.name}`}
              className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="aspect-[4/3] relative">
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-2xl font-bold">{city.name}</h3>
                  <p className="text-sm text-gray-200">
                    {city.properties} properties
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
