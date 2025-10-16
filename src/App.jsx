import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Footer from "./Pages/Footer";
import Home from "./Pages/Home";
import Dashboard from "./Pages/Dashboard";
import Products from "./Pages/Products";
import Distributors from "./Pages/Distributors";
import Customers from "./Pages/Customers";
import Salesman from "./Pages/Salesman"
import Assignments from "./Pages/Assignments"
import Settings from "./Pages/Settings";
import CustomToaster from "./Components/CustomeToaster";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-950 text-gray-100">
        <Navbar />
        <main className="p-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/distributors" element={<Distributors />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/salesmen" element={<Salesman />} />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>

        {/* Footer */}
        <Footer />
        {/* Global Toast Renderer */}
        <CustomToaster />
      </div>
    </Router>
  );
}

export default App;
