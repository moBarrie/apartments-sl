import Link from "next/link";
import {
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiMail,
  FiPhone,
} from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-ocean-500 to-palm-500 rounded-lg" />
              <span className="font-bold text-xl text-white">RentalsSL</span>
            </div>
            <p className="text-sm mb-4">
              Find your perfect apartment in Sierra Leone. Trusted by thousands
              of renters and landlords.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-ocean-400 transition">
                <FiFacebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-ocean-400 transition">
                <FiTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-ocean-400 transition">
                <FiInstagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/apartments"
                  className="hover:text-ocean-400 transition"
                >
                  Browse Apartments
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-ocean-400 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="hover:text-ocean-400 transition"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/become-landlord"
                  className="hover:text-ocean-400 transition"
                >
                  Become a Landlord
                </Link>
              </li>
            </ul>
          </div>

          {/* Cities */}
          <div>
            <h3 className="text-white font-semibold mb-4">Popular Cities</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/apartments?city=Freetown"
                  className="hover:text-ocean-400 transition"
                >
                  Freetown
                </Link>
              </li>
              <li>
                <Link
                  href="/apartments?city=Bo"
                  className="hover:text-ocean-400 transition"
                >
                  Bo
                </Link>
              </li>
              <li>
                <Link
                  href="/apartments?city=Kenema"
                  className="hover:text-ocean-400 transition"
                >
                  Kenema
                </Link>
              </li>
              <li>
                <Link
                  href="/apartments?city=Makeni"
                  className="hover:text-ocean-400 transition"
                >
                  Makeni
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <FiMail className="w-4 h-4" />
                <span>support@rentalssk.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <FiPhone className="w-4 h-4" />
                <span>+232 76 123 456</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>
            &copy; {new Date().getFullYear()} Apartment Rentals SL. All rights
            reserved.
          </p>
          <div className="mt-2 space-x-4">
            <Link href="/privacy" className="hover:text-ocean-400 transition">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-ocean-400 transition">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
