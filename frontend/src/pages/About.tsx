import { Link } from "react-router-dom";
import { ShieldCheck, Zap, Users, Gem } from "lucide-react";

const values = [
  {
    icon: ShieldCheck,
    title: "Trust",
    description:
      "Every product is verified for quality and authenticity before listing.",
  },
  {
    icon: Zap,
    title: "Speed",
    description:
      "We obsess over delivery times so your orders arrive when promised.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "Built around real customer feedback, not just business metrics.",
  },
  {
    icon: Gem,
    title: "Quality",
    description:
      "We curate the best — no filler, no junk, just great products.",
  },
];

const team = [
  {
    initial: "A",
    name: "Aakash Patil",
    role: "Founder & CEO",
    color: "bg-purple-600",
  },
  {
    initial: "S",
    name: "Sakshi Kadale",
    role: "Head of Product",
    color: "bg-pink-600",
  },
  {
    initial: "S",
    name: "Sam Verma",
    role: "Lead Engineer",
    color: "bg-blue-600",
  },
  {
    initial: "R",
    name: "Raj Pawar",
    role: "Design Director",
    color: "bg-emerald-600",
  },
];

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <section className="text-center mb-20">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          What We{" "}
          <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Stand For
          </span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-14">
          The principles that guide everything we build and ship.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-left hover:border-purple-600/40 transition-colors"
            >
              <div className="bg-purple-600/10 border border-purple-600/20 w-11 h-11 rounded-xl flex items-center justify-center mb-4">
                <Icon size={20} className="text-purple-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">
                {title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-20">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-14">
          Meet the Team
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map(({ initial, name, role, color }) => (
            <div
              key={name}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center hover:border-purple-600/40 transition-colors"
            >
              <div
                className={`${color} w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4`}
              >
                {initial}
              </div>
              <h3 className="text-white font-semibold text-lg mb-1">
                {name}
              </h3>
              <p className="text-gray-400 text-sm">{role}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="text-center bg-gray-900 border border-gray-800 rounded-3xl px-6 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to shop?
        </h2>
        <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
          Explore thousands of products at unbeatable prices.
        </p>
        <Link
          to="/"
          className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-8 py-3.5 rounded-full text-sm font-medium transition-colors"
        >
          Browse Products
        </Link>
      </section>
    </div>
  );
};

export default About;
