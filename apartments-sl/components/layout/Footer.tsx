import Link from "next/link";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import { usePathname } from "next/navigation";
import Logo from "@/components/common/Logo";

export default function Footer() {
  const pathname = usePathname();
  
  // Don't show footer on auth pages
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  if (isAuthPage) return null;

  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <Logo variant="light" className="mb-4" />

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
