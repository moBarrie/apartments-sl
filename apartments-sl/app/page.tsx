import Hero from "@/components/home/Hero";
import FeaturedApartments from "@/components/home/FeaturedApartments";
import Link from "next/link";
import {
  FaShieldAlt,
  FaBolt,
  FaHeadset,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaMobileAlt,
} from "react-icons/fa";

export default function Home() {
  return (
    <>
      <Hero />

      {/* How it works */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-green-600 font-bold text-sm uppercase tracking-widest mb-3">
              How it works
            </p>
            <h2 className="text-4xl font-black text-gray-900">
              Find Your Home in 3 Steps
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Search",
                desc: "Browse listings in your city with filters for price, size, and amenities.",
                icon: "🔍",
              },
              {
                step: "02",
                title: "Choose",
                desc: "View verified photos, read property details, and connect with the landlord.",
                icon: "🏠",
              },
              {
                step: "03",
                title: "Book",
                desc: "Reserve your apartment securely and move in with confidence.",
                icon: "✅",
              },
            ].map(({ step, title, desc, icon }) => (
              <div key={step} className="text-center">
                <div className="w-16 h-16 bg-green-50 border-2 border-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl">
                  {icon}
                </div>
                <p className="text-5xl font-black text-gray-100 mb-1">{step}</p>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {title}
                </h3>
                <p className="text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-green-600 font-bold text-sm uppercase tracking-widest mb-2">
                Featured
              </p>
              <h2 className="text-4xl font-black text-gray-900">
                Latest Listings
              </h2>
            </div>
            <Link
              href="/apartments"
              className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              View All →
            </Link>
          </div>
          <FeaturedApartments />
          <div className="mt-10 text-center md:hidden">
            <Link
              href="/apartments"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              View All Properties →
            </Link>
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-primary-600 font-bold text-sm uppercase tracking-widest mb-3">
              Why Us
            </p>
            <h2 className="text-4xl font-black text-gray-900">
              Why Choose Apartments.SL?
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              The most trusted rental platform in Sierra Leone
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: FaShieldAlt,
                title: "Verified Listings",
                desc: "Every property is verified and inspected before listing",
                iconBg: "bg-green-50",
                iconColor: "text-green-600",
              },
              {
                icon: FaBolt,
                title: "Instant Booking",
                desc: "Reserve your home with our streamlined booking process",
                iconBg: "bg-blue-50",
                iconColor: "text-primary-600",
              },
              {
                icon: FaHeadset,
                title: "24/7 Support",
                desc: "Our dedicated team is always available to help you",
                iconBg: "bg-green-50",
                iconColor: "text-green-600",
              },
              {
                icon: FaCheckCircle,
                title: "No Hidden Fees",
                desc: "Transparent pricing with no surprises at signing",
                iconBg: "bg-blue-50",
                iconColor: "text-primary-600",
              },
              {
                icon: FaMapMarkerAlt,
                title: "Prime Locations",
                desc: "Properties in the best neighborhoods across all cities",
                iconBg: "bg-green-50",
                iconColor: "text-green-600",
              },
              {
                icon: FaMobileAlt,
                title: "Mobile Friendly",
                desc: "Seamless experience on any device, anytime",
                iconBg: "bg-blue-50",
                iconColor: "text-primary-600",
              },
            ].map(({ icon: Icon, title, desc, iconBg, iconColor }) => (
              <div
                key={title}
                className="p-6 rounded-2xl border border-gray-100 bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${iconBg}`}
                >
                  <Icon className={`text-xl ${iconColor}`} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-green-400 font-bold text-sm uppercase tracking-widest mb-4">
            Get Started
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-5">
            Ready to Find Your Dream Home?
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of Sierra Leoneans who found their perfect apartment
            on Apartments.SL
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/apartments"
              className="inline-flex items-center justify-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg transition-colors"
            >
              Browse Apartments
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-8 py-4 bg-white/10 border border-white/20 text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-colors"
            >
              List Your Property
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
