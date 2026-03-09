import { FiStar } from "react-icons/fi";

const testimonials = [
  {
    name: "Mariama Kamara",
    role: "Software Engineer",
    image: "https://via.placeholder.com/100",
    rating: 5,
    text: "Found my perfect apartment in Freetown within days! The verification process made me feel safe.",
  },
  {
    name: "Abdul Rahman",
    role: "Business Owner",
    image: "https://via.placeholder.com/100",
    rating: 5,
    text: "As a landlord, this platform has made managing my properties so much easier. Highly recommend!",
  },
  {
    name: "Sarah Johnson",
    role: "NGO Worker",
    image: "https://via.placeholder.com/100",
    rating: 5,
    text: "Booking from abroad was seamless. The landlord was professional and the apartment exceeded expectations.",
  },
];

export default function Testimonials() {
  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            What Our Users Say
          </h2>
          <p className="text-gray-600 text-lg">
            Join thousands of satisfied customers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="card p-6">
              <div className="flex items-center gap-1 text-sand-500 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FiStar key={i} className="fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-semibold text-gray-900">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
