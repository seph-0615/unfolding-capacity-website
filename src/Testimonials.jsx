
import React from "react";
import { ArrowLeft, Quote, Star } from "lucide-react";
// Animated Unfolding Capacity Brand Logo
const BrandLogo = ({ className = "h-10 w-auto", scrollY = 0 }) => {
  const flapAngle = Math.sin(scrollY * 0.008) * 40;

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ perspective: "600px" }}
    >
      <svg
        viewBox="0 0 240 330"
        className="h-full w-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: "visible" }}
      >
        <g
          style={{
            transform: `rotateY(${flapAngle}deg)`,
            transformOrigin: "222px 50%",
          }}
        >
          <path
            d="M220 98C150 40 50 20 20 80C-10 140 40 180 40 180C40 180 0 220 20 280C40 330 130 330 180 290C210 260 220 230 220 230V98Z"
            fill="#2596be"
          />
          <text x="65" y="150" fill="white" fontSize="70" fontFamily="'Playfair Display', serif" fontWeight="800" fontStyle="italic">U</text>
          <text x="80" y="250" fill="white" fontSize="70" fontFamily="'Playfair Display', serif" fontWeight="800" fontStyle="italic">C</text>
        </g>
        <rect x="222" y="100" width="14" height="150" fill="#cbd5e1" rx="7" />
      </svg>
    </div>
  );
};

const testimonials = [
  {
    name: "Dr Eddie Nedzingahe",
    role: "Leader at the Department of Basic Education (DBE)",
    event: "Unfolding Capacity Leadership MasterClass",
    featured: true,
    text: `Let me express my heartfelt appreciation for the exceptional presentation. Your message was not only informative but also inspiring and timely.

What stood out most was your ability to speak honestly about the realities of leadership during challenging times while still giving us hope and practical ways to move forward. Your insights, personal touch, and relatable examples made the session meaningful and easy to connect with.

You reminded us that leadership is not about having all the answers, but about remaining strong, adaptable, and focused when circumstances are difficult. Your words challenged us to reflect on our own leadership journeys and encouraged us to lead with courage, wisdom, and compassion.

Thank you for the time, effort, and passion you invested in preparing and sharing such a powerful presentation. The impact of your message will remain with us long after the session has ended.

Thank you for making a difference.`,
  },
  {
    name: "Leadership MasterClass Attendee",
    role: "Attendee",
    event: "Unfolding Capacity Leadership MasterClass",
    featured: false,
    text: `I would like to commend you for an outstanding presentation. It was well-researched, clearly articulated, and highly engaging.`,
  },
  {
    name: "School Principal",
    role: "Soutpansberg West Circuit",
    event: "Leadership and Learner Empowerment",
    featured: true,
    result: true,
    text: `Our school was the least performing in the circuit; it had become well known for misbehaving learners and a lack of professionalism, coupled with consistent poor performance.

But things changed when Unfolding Capacity came and delivered their leadership and learner empowerment session.

That very year, our school soared from a 56% Grade 12 pass rate to a 92% pass rate. Today, our learners form part of the entire circuit's top performers.

Unfolding Capacity has transformed our school culture.`,
  },
];

export default function Testimonials({ onBack }) {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-[#0B1320]">

      {/* Header */}
      <header className="bg-[#0B1320] text-white">
        <div className="flex items-center gap-3 cursor-pointer group">
  <BrandLogo className="h-10 w-auto" scrollY={0} />

  <div className="flex flex-col justify-center h-10">
    <span className="text-[19px] font-bold tracking-tight leading-none text-white group-hover:text-[#2596be] transition-colors">
      UNFOLDING
    </span>

    <span className="text-[8.5px] tracking-[0.45em] font-bold uppercase leading-none mt-1 text-[#2596be]">
      CAPACITY
    </span>
  </div>


          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm font-semibold text-white hover:text-[#dca54c] transition"
          >
            <ArrowLeft size={18} />
            Back to Home
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0B1320] text-white py-20 px-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#2596be] opacity-10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto text-center">
          <p className="text-[#dca54c] uppercase tracking-[0.3em] text-sm font-semibold mb-5">
            Voices & Experiences
          </p>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            What People Say <br />
            <span className="text-[#2596be]">About Us</span>
          </h1>

          <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
            Feedback and reflections from people who have experienced
            Unfolding Capacity's leadership development and learner
            empowerment work.
          </p>

          <div className="w-20 h-1 bg-[#dca54c] mx-auto mt-8 rounded-full" />
        </div>
      </section>

      {/* Testimonials */}
      <main className="max-w-6xl mx-auto px-6 py-16 md:py-24">

        <div className="text-center mb-14">
          <p className="text-[#2596be] uppercase tracking-widest text-sm font-bold mb-3">
            Real Experiences. Meaningful Impact.
          </p>

          <h2 className="text-3xl md:text-4xl font-bold text-[#0B1320]">
            Stories That Speak for Themselves
          </h2>
        </div>

        <div className="space-y-10">
          {testimonials.map((item, index) => (
            <article
              key={index}
              className="relative bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#2596be]" />

              <div className="p-8 md:p-12">
                <div className="flex items-center justify-between mb-7">
                  <Quote
                    size={42}
                    className="text-[#dca54c] opacity-80"
                  />

                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={15}
                        className="fill-[#dca54c] text-[#dca54c]"
                      />
                    ))}
                  </div>
                </div>

                {item.result && (
                  <div className="grid grid-cols-2 gap-4 mb-8 max-w-md">
                    <div className="bg-[#f0f5f8] rounded-xl p-5 text-center">
                      <p className="text-sm text-gray-500 mb-1">
                        Previous pass rate
                      </p>
                      <p className="text-3xl font-bold text-[#0B1320]">
                        56%
                      </p>
                    </div>

                    <div className="bg-[#e8f6fa] rounded-xl p-5 text-center">
                      <p className="text-sm text-gray-500 mb-1">
                        Improved pass rate
                      </p>
                      <p className="text-3xl font-bold text-[#2596be]">
                        92%
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-5 text-gray-600 leading-8 text-base md:text-lg">
                  {item.text.split("\n\n").map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>

                <div className="mt-9 pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-[#0B1320]">
                    {item.name}
                  </h3>

                  <p className="text-[#2596be] font-semibold text-sm mt-1">
                    {item.role}
                  </p>

                  <p className="text-gray-400 text-sm mt-2">
                    {item.event}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Closing message */}
        <section className="mt-20 bg-[#0B1320] rounded-2xl p-10 md:p-14 text-center text-white">
          <p className="text-[#dca54c] uppercase tracking-widest text-sm font-semibold mb-4">
            Our Commitment
          </p>

          <h2 className="text-3xl md:text-4xl font-bold mb-5">
            Every Experience Matters.
          </h2>

          <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed mb-8">
            At Unfolding Capacity, we remain committed to unlocking human
            potential, strengthening leadership and creating meaningful
            transformation in individuals, schools and organisations.
          </p>

          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 bg-[#dca54c] hover:bg-[#c18d37] text-[#0B1320] font-bold px-7 py-3 rounded-lg transition"
          >
            <ArrowLeft size={18} />
            Return to Homepage
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0B1320] text-gray-400 text-center py-7 px-6 text-sm">
        © {new Date().getFullYear()} Unfolding Capacity. All rights reserved.
      </footer>
    </div>
  );
}
