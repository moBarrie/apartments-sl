import Image from "next/image";
import Link from "next/link";
import { FiBed, FiMapPin, FiStar } from "react-icons/fi";

interface ApartmentCardProps {
  apartment: {
    id: string;
    title: string;
    city: string;
    pricePerNight: number;
    bedrooms: number;
    bathrooms: number;
    rating: number;
    images: { imageUrl: string }[];
  };
}

export default function ApartmentCard({ apartment }: ApartmentCardProps) {
  const image =
    apartment.images[0]?.imageUrl || "https://via.placeholder.com/400x300";

  return (
    <Link
      href={`/apartments/${apartment.id}`}
      className="card card-hover group"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={apartment.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full text-sm font-semibold">
          ${apartment.pricePerNight}/night
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">
          {apartment.title}
        </h3>

        <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
          <FiMapPin className="w-4 h-4" />
          <span>{apartment.city}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <FiBed className="w-4 h-4" />
              <span>{apartment.bedrooms} beds</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-sand-500">
            <FiStar className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium text-gray-900">
              {apartment.rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
