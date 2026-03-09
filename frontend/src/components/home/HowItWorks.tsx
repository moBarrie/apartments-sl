import { FiSearch, FiCalendar, FiHome, FiCheckCircle } from "react-icons/fi";

const steps = [
  {
    icon: FiSearch,
    title: "Search",
    description: "Browse verified apartments in your preferred city",
  },
  {
    icon: FiCalendar,
    title: "Book",
    description: "Select your dates and make a secure booking",
  },
  {
    icon: FiCheckCircle,
    title: "Confirm",
    description: "Receive instant confirmation and apartment details",
  },
  {
    icon: FiHome,
    title: "Move In",
    description: "Meet the landlord and settle into your new home",
  },
];

export default function HowItWorks() {
  return (
    <div className="py-16 bg-ocean-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-gray-600 text-lg">
            Find your perfect apartment in 4 simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-ocean-600 rounded-full flex items-center justify-center">
                  <step.icon className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-palm-500 rounded-full flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
