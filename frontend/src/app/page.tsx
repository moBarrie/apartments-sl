import Hero from "@/components/home/Hero";
import SearchBar from "@/components/home/SearchBar";
import FeaturedApartments from "@/components/home/FeaturedApartments";
import HowItWorks from "@/components/home/HowItWorks";
import PopularCities from "@/components/home/PopularCities";
import { Suspense } from "react";

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <Hero />

      {/* Search Bar */}
      <section className="bg-white py-8 -mt-8 relative z-10">
        <div className="container mx-auto px-4">
          <SearchBar />
        </div>
      </section>

      {/* Featured Apartments */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Featured Apartments
          </h2>
          <Suspense fallback={<div>Loading...</div>}>
            <FeaturedApartments />
          </Suspense>
        </div>
      </section>

      {/* Popular Cities */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Explore Popular Cities
          </h2>
          <PopularCities />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-primary-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            How It Works
          </h2>
          <HowItWorks />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Find Your Perfect Home?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of happy renters across Sierra Leone
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/apartments"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Browse Apartments
            </a>
            <a
              href="/list-property"
              className="bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-800 transition border-2 border-white"
            >
              List Your Property
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
