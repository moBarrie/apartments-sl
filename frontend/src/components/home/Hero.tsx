export default function Hero() {
  return (
    <div className="relative bg-gradient-to-br from-ocean-600 to-palm-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Find Your Perfect Home in{" "}
            <span className="text-sand-300">Sierra Leone</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-ocean-50">
            Discover verified apartments in Freetown, Bo, Kenema, and Makeni
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/apartments"
              className="bg-white text-ocean-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition"
            >
              Browse Apartments
            </a>
            <a
              href="/list-property"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition"
            >
              List Your Property
            </a>
          </div>
        </div>
      </div>

      {/* Wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="#F9FAFB"
          />
        </svg>
      </div>
    </div>
  );
}
