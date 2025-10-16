import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay },
  }),
};

const Home = () => {
  return (
    <div className="bg-gray-950 text-white overflow-hidden">
      {/* Hero Section */}
      <section className="text-center py-24 px-6 bg-gradient-to-b from-gray-900 via-gray-950 to-black relative">
        {/* Glow Circle */}
        <motion.div
          className="absolute -z-10 left-1/2 top-1/2 w-[600px] h-[600px] bg-indigo-600/20 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />

        <motion.h1
          className="text-5xl font-extrabold mb-4"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          Welcome to <span className="text-indigo-500">Nexora</span>
        </motion.h1>

        <motion.p
          className="text-gray-400 text-lg max-w-2xl mx-auto mb-8"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.2}
        >
          Streamline your entire sales workflow — from product management to
          distributor tracking — all in one elegant dashboard.
        </motion.p>

        <motion.div
          className="flex justify-center gap-4"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.4}
        >
          <Link
            to="/dashboard"
            className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg font-semibold transition-transform hover:scale-105"
          >
            Go to Dashboard
          </Link>
          <Link
            to="/signup"
            className="bg-transparent border border-indigo-500 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-500 hover:text-white transition-all"
          >
            Get Started
          </Link>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 max-w-6xl mx-auto text-center">
        <motion.h2
          className="text-3xl font-bold mb-10 text-indigo-400"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          Powerful Features for Modern Sales Teams
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {[
            {
              title: "📦 Product Management",
              desc: "Add, update, and track stock in real-time with intuitive controls.",
            },
            {
              title: "👥 Distributor Network",
              desc: "Easily assign products to distributors and monitor performance.",
            },
            {
              title: "💼 Salesman Tracking",
              desc: "View your sales team’s regions, targets, and activity stats.",
            },
            {
              title: "📊 Dashboard Insights",
              desc: "Visualize weekly sales data and identify top performers.",
            },
            {
              title: "🗂 Assignments Overview",
              desc: "See how your network connects — salesman ↔ distributor ↔ products.",
            },
            {
              title: "☁️ Data Import & Export",
              desc: "Import product lists or export reports in a single click.",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 hover:scale-105 hover:border-indigo-500 transition-transform backdrop-blur-lg shadow-lg"
              variants={fadeUp}
              custom={i * 0.1}
            >
              <h3 className="text-xl font-semibold mb-3 text-indigo-400">
                {feature.title}
              </h3>
              <p className="text-gray-400">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Banner */}
      <motion.section
        className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl font-bold mb-4">
          Start Managing Smarter with Nexora
        </h2>
        <p className="text-gray-200 mb-8">
          Join hundreds of teams simplifying their sales workflow today.
        </p>
        <Link
          to="/login"
          className="bg-white text-indigo-700 font-semibold px-8 py-3 rounded-lg shadow-md hover:shadow-xl hover:bg-gray-100 transition-all"
        >
          Login Now
        </Link>
      </motion.section>
    </div>
  );
};

export default Home;


