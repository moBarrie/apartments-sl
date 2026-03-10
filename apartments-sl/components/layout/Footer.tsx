import Link from "next/link";
import { FaFacebook, FaTwitter, FaInstagram, FaBuilding } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                <div className="absolute top-0 left-0 right-0 h-[33.33%] bg-green-600" />
                <div className="absolute top-[33.33%] left-0 right-0 h-[33.33%] bg-white" />
                <div className="absolute bottom-0 left-0 right-0 h-[33.33%] bg-primary-600" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaBuilding className="w-5 h-5 text-gray-900" />
                </div>
              </div>
              <span className="text-white font-bold text-lg">
                Apartments<span className="text-green-500">.SL</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-5">
              Sierra Leone's most trusted apartment rental marketplace.
            </p>
            <div className="flex gap-3">
              {[FaFacebook, FaTwitter, FaInstagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
                >
                  <Icon className="text-sm" />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-white font-semibold mb-4">Explore</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: "/apartments", label: "Browse Apartments" },
                { href: "/apartments?city=Freetown", label: "Freetown" },
                { href: "/apartments?city=Bo", label: "Bo" },
                { href: "/apartments?city=Kenema", label: "Kenema" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Landlords */}
          <div>
            <h4 className="text-white font-semibold mb-4">For Landlords</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: "/signup", label: "List Property" },
                { href: "/dashboard/landlord", label: "Dashboard" },
                { href: "/pricing", label: "Pricing" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Contact" },
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms of Service" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <p>© 2026 Apartments.SL. All rights reserved.</p>
          <p>Made with ❤️ for Sierra Leone</p>
        </div>
      </div>
    </footer>
  );
}
