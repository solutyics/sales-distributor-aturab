import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FaBoxOpen, FaUsers, FaUserTie, FaChartLine, FaPlus } from "react-icons/fa";
import {
  getProductsApi,
  getDistributorsApi,
  getCustomersApi,
  getSalesmenApi,
} from "../Api/Api";

const Dashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    distributors: 0,
    customers: 0,
    salesmen: 0,
  });

  const [lowStock, setLowStock] = useState([]);
  const [topDistributors, setTopDistributors] = useState([]);

  const weeklySales = [
    { week: "wk1", sales: 45000 },
    { week: "wk2", sales: 52000 },
    { week: "wk3", sales: 38000 },
    { week: "wk4", sales: 48000 },
    { week: "wk5", sales: 60000 },
    { week: "wk6", sales: 55000 },
    { week: "wk7", sales: 49000 },
    { week: "wk8", sales: 59000 },
    { week: "wk9", sales: 38000 },
    { week: "wk10", sales: 26000 },
    { week: "wk11", sales: 68000 },
    { week: "wk12", sales: 59000 },
  ];

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay },
    }),
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const products = await getProductsApi();
        const distributors = await getDistributorsApi();
        const customers = await getCustomersApi();
        const salesmen = await getSalesmenApi();

        setStats({
          products: products?.length || 0,
          distributors: distributors?.length || 0,
          customers: customers?.length || 0,
          salesmen: salesmen?.length || 0,
        });

        // Low Stock
        const lowStockProducts = products?.filter(p => p.Product_stock <= 5) || [];
        setLowStock(lowStockProducts);

        // Detect correct sales field dynamically
        const distributorsWithSales = distributors?.map(d => ({
          ...d,
          _sales: d.sales ?? d.totalSales ?? 0,
        })) || [];

        // Top 3 distributors
        const top3 = distributorsWithSales
          .sort((a, b) => b._sales - a._sales)
          .slice(0, 3);
        setTopDistributors(top3);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="p-8 bg-gray-950 min-h-screen text-white">
      {/* Header */}
      <motion.h1
        className="text-4xl font-bold mb-8 text-indigo-400"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        Dashboard
      </motion.h1>

      {/* Summary Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
        initial="hidden"
        animate="visible"
      >
        {[
          { icon: <FaBoxOpen />, label: "Total Products", value: stats.products, color: "from-indigo-500 to-purple-500" },
          { icon: <FaUsers />, label: "Distributors", value: stats.distributors, color: "from-pink-500 to-rose-500" },
          { icon: <FaUserTie />, label: "Customers", value: stats.customers, color: "from-blue-500 to-cyan-500" },
          { icon: <FaChartLine />, label: "Salesmen", value: stats.salesmen, color: "from-green-500 to-emerald-500" },
        ].map((item, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            custom={i * 0.1}
            className={`p-6 rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg flex flex-col justify-center items-center hover:scale-105 transition-transform`}
          >
            <div className="text-4xl mb-2">{item.icon}</div>
            <div className="text-lg font-semibold">{item.label}</div>
            <div className="text-3xl font-bold mt-1">{(item.value || 0).toLocaleString()}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Low Stock + Top Distributors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Low Stock */}
        <motion.div
          className="bg-gray-900/60 rounded-xl p-6 border border-gray-800 backdrop-blur-md"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-xl font-semibold mb-4 text-indigo-400">Low Stock (≤5)</h2>
          {lowStock.length > 0 ? (
            <table className="w-full text-base">
              <thead className="border-b border-gray-700">
                <tr className="text-left">
                  <th className="pb-2">Serial No</th>
                  <th className="pb-2">Name</th>
                  <th className="pb-2 text-right">Stock</th>
                </tr>
              </thead>
              <tbody className="text-base">
                {lowStock.map((item, i) => (
                  <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/30 transition">
                    <td className="py-2">{i + 1}</td>
                    <td className="py-2">{item.Product_name}</td>
                    <td className="py-2 text-right text-amber-400 font-semibold">{item.Product_stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-400">No low stock products.</p>
          )}
        </motion.div>

        {/* Top Distributors */}
        <motion.div
          className="bg-gray-900/60 rounded-xl p-6 border border-gray-800 backdrop-blur-md"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-xl font-semibold mb-4 text-indigo-400">Top Distributors (30d by Sales)</h2>
          {topDistributors.length > 0 ? (
            <ul className="space-y-3">
              {topDistributors.map((d, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center bg-gray-800/40 p-3 rounded-lg hover:bg-gray-700/50 transition"
                >
                  <span>{i + 1}) {d.name}</span>
                  <span className="font-semibold text-green-400">
                    ${((d._sales || 0)).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No distributor data available.</p>
          )}
        </motion.div>
      </div>

      {/* Sales by Week Chart */}
      <motion.div
        className="bg-gray-900/60 rounded-xl p-6 border border-gray-800 backdrop-blur-md mb-10"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <h2 className="text-xl font-semibold mb-6 text-indigo-400">Sales by Week (Last 12 Weeks)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weeklySales}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="week" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", color: "#fff" }} />
            <Bar dataKey="sales" fill="#6366f1" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        className="flex flex-wrap justify-center gap-4"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {["Product", "Distributor", "Customer", "Salesman"].map((action, i) => (
          <button
            key={i}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-lg font-medium shadow-md transition-transform hover:scale-105"
          >
            <FaPlus /> + {action}
          </button>
        ))}
      </motion.div>
    </div>
  );
};

export default Dashboard;
