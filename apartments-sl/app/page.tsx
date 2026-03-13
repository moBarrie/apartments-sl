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
  FaArrowRight,
} from "react-icons/fa";

export default function Home() {
  return (
    <div className="bg-background">
      <Hero />

      {/* How it works */}
      <section className="py-32 relative overflow-hidden">
        {/* Background Decorative Blob */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="text-emerald-600 font-bold text-xs uppercase tracking-[0.2em] mb-4">
              Streamlined Process
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Secure Your Home in <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-400">3 Steps</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto relative z-10">
            {[
              {
                step: "01",
                title: "Discover",
                desc: "Explore an exclusive collection of verified properties tailored to your sophisticated lifestyle.",
                icon: "✨",
              },
              {
                step: "02",
                title: "Evaluate",
                desc: "Review high-resolution imagery and precise details before engaging with our vetted landlords.",
                icon: "📐",
              },
              {
                step: "03",
                title: "Secure",
                desc: "Finalize your booking instantly through our encrypted, seamless reservation system.",
                icon: "🗝️",
              },
            ].map(({ step, title, desc, icon }) => (
              <div key={step} className="group text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl flex items-center justify-center mb-8 text-3xl group-hover:scale-110 group-hover:shadow-[0_8px_30px_rgb(16,185,129,0.15)] transition-all duration-500">
                  {icon}
                </div>
                <p className="text-7xl font-black text-slate-100 mb-2 group-hover:text-emerald-50 transition-colors duration-500 tracking-tighter">{step}</p>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">
                  {title}
                </h3>
                <p className="text-slate-500 leading-relaxed font-light">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-32 bg-slate-50 border-y border-slate-200/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div>
              <p className="text-emerald-600 font-bold text-xs uppercase tracking-[0.2em] mb-4">
                Curated Selection
              </p>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                Featured Properties
              </h2>
            </div>
            <Link
              href="/apartments"
              className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-semibold hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all group"
            >
              View Collection
              <FaArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors group-hover:translate-x-1" />
            </Link>
          </div>
          
          <FeaturedApartments />
          
        </div>
      </section>

      {/* Why Us */}
      <section className="py-32 relative overflow-hidden bg-white">
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[140px] -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="text-emerald-600 font-bold text-xs uppercase tracking-[0.2em] mb-4">
              The Standard
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">
              Why Apartments.SL?
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto font-light leading-relaxed">
              We've redefined the rental experience to offer unparalleled convenience, security, and luxury for our exclusive clientele.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: FaShieldAlt,
                title: "Meticulously Verified",
                desc: "Each property passes our rigorous 50-point inspection before it joins our exclusive collection.",
                iconBg: "bg-emerald-50",
                iconColor: "text-emerald-600",
                borderColor: "group-hover:border-emerald-200"
              },
              {
                icon: FaBolt,
                title: "Instant Residency",
                desc: "Bypass traditional delays with our fully digitized, instant booking and contract system.",
                iconBg: "bg-emerald-50",
                iconColor: "text-emerald-600",
                borderColor: "group-hover:border-emerald-200"
              },
              {
                icon: FaHeadset,
                title: "Concierge Support",
                desc: "Our dedicated specialists are available 24/7 to ensure your complete satisfaction.",
                iconBg: "bg-slate-50",
                iconColor: "text-slate-700",
                borderColor: "group-hover:border-slate-300"
              },
              {
                icon: FaCheckCircle,
                title: "Transparent Integrity",
                desc: "Absolutely no hidden fees, unexpected charges, or convoluted contract terms. Ever.",
                iconBg: "bg-emerald-50",
                iconColor: "text-emerald-600",
                borderColor: "group-hover:border-emerald-200"
              },
              {
                icon: FaMapMarkerAlt,
                title: "Prestigious Locations",
                desc: "We solely feature properties in the most desirable and secure neighborhoods.",
                iconBg: "bg-emerald-50",
                iconColor: "text-emerald-600",
                borderColor: "group-hover:border-emerald-200"
              },
              {
                icon: FaMobileAlt,
                title: "Seamless Platform",
                desc: "Manage your residency elegantly from any device, anywhere in the world.",
                iconBg: "bg-slate-50",
                iconColor: "text-slate-700",
                borderColor: "group-hover:border-slate-300"
              },
            ].map(({ icon: Icon, title, desc, iconBg, iconColor, borderColor }) => (
              <div
                key={title}
                className={`p-8 rounded-[2rem] border border-slate-100 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-2 transition-all duration-500 group ${borderColor}`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${iconBg}`}
                >
                  <Icon className={`text-2xl ${iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{title}</h3>
                <p className="text-slate-500 leading-relaxed font-light">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern CTA */}
      <section className="py-32 relative bg-slate-950 overflow-hidden">
        {/* Dynamic Abstract Background */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay">
           <div className="absolute w-[800px] h-[800px] bg-emerald-500 rounded-full blur-[150px] -top-96 -right-40 animate-blob"></div>
           <div className="absolute w-[800px] h-[800px] bg-emerald-700 rounded-full blur-[150px] -bottom-96 -left-40 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
          <p className="text-emerald-400 font-bold text-xs uppercase tracking-[0.2em] mb-6">
            The Next Step
          </p>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-8 tracking-tight">
            Ready to Elevate Your Living <span className="font-light italic text-slate-400">Experience?</span>
          </h2>
          <p className="text-slate-400 text-xl mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Join the elite community of residents who have already discovered their perfect sanctuary through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link
              href="/apartments"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-2xl font-bold tracking-wide transition-all shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:shadow-[0_10px_40px_rgba(16,185,129,0.5)] group"
            >
              Browse Collection
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-8 py-4 glass text-white rounded-2xl font-bold tracking-wide hover:bg-white/10 border-white/20 transition-all"
            >
              List Your Property
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
