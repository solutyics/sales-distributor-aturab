import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaSearch, FaEdit, FaTrash, FaDownload, FaEye } from "react-icons/fa";
import toast from "react-hot-toast";
import { saveAs } from "file-saver";
import CustomToaster from "../Components/CustomeToaster";
import {
  getDistributorsApi,
  addDistributorApi,
  updateDistributorApi,
  deleteDistributorApi,
  getProductsApi, 
  getSalesmenApi,
} from "../Api/Api";

const Distributors = () => {
  const [distributors, setDistributors] = useState([]);
  const [salesmen, setSalesmen] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [viewDistributor, setViewDistributor] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // New product states
  const [assignedProducts, setAssignedProducts] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [assignedSearch, setAssignedSearch] = useState("");
  const [availableSearch, setAvailableSearch] = useState("");
  const [notes, setNotes] = useState("");

  const filteredAssigned = assignedProducts.filter((p) =>
  p.Product_name.toLowerCase().includes(assignedSearch.toLowerCase())
);

const filteredAvailable = availableProducts.filter((p) =>
  p.Product_name.toLowerCase().includes(availableSearch.toLowerCase())
);

const handleAddProduct = (product) => {
  setAssignedProducts([...assignedProducts, product]);
  setAvailableProducts(availableProducts.filter((p) => p.Product_ID !== product.Product_ID));
  toast.success(`${product.Product_name} assigned successfully`);
};

const handleRemoveProduct = (product) => {
  setAvailableProducts([...availableProducts, product]);
  setAssignedProducts(assignedProducts.filter((p) => p.Product_ID !== product.Product_ID));
  toast.error(`${product.Product_name} removed`);
};


  const [formData, setFormData] = useState({
    distributor_id: "",
    distributor_name: "",
    distributor_company: "",
    distributor_region: "North-East",
    distributor_phone: "",
    distributor_email: "",
    distributor_contact: "",
    distributor_status: "Active",
    distributor_assignedProducts: 0,
    salesman_id: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRegion, setFilterRegion] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(false);

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay },
    }),
  };

 // ─── Fetch All Distributors & Salesmen ──────────────────────────────
  useEffect(() => {
    fetchDistributors();
    fetchSalesmen(); 
  }, []);

  const fetchDistributors = async () => {
    try {
      const data = await getDistributorsApi();
      setDistributors(data);
    } catch (error) {
      console.error("Error fetching distributors:", error);
      toast.error("Failed to fetch distributors.");
    }
  };

  const fetchSalesmen = async () => {
    try {
      const data = await getSalesmenApi();
      setSalesmen(data); 
    } catch (error) {
      console.error("Error fetching salesmen:", error);
      toast.error("Failed to fetch salesmen");
    }
  };

  // ─── Input Change ────────────────────────────────────────
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  // CSV file handler 
  // ─── Export Distributors to CSV ─────────────
const handleExportDistributorsCSV = () => {
  if (distributors.length === 0) {
    toast.error("No distributors available to export!");
    return;
  }

  // Define CSV headers
  const headers = [
    "Serial No",
    "Distributor Name",
    "Region",
    "Phone",
    "Status",
    "Assigned Products",
  ];

  // Build CSV rows
  const rows = distributors.map((d, index) => {
    const assignedSalesman =
      salesmen.find((s) => s.Salesman_ID === d.salesman_id)?.Salesman_name || "—";

    return [
      index + 1,
      `"${d.distributor_name || ""}"`,
      `"${d.distributor_region || ""}"`,
      `"${d.distributor_phone || ""}"`,
      `"${d.distributor_status || ""}"`,
      `"${Array.isArray(d.distributor_assignedProducts) ? d.distributor_assignedProducts.join("; ") : d.distributor_assignedProducts || 0}"`,
    ].join(",");
  });

  // Combine into CSV
  const csvContent = [headers.join(","), ...rows].join("\n");

  // Create blob and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const date = new Date().toISOString().split("T")[0];
  saveAs(blob, `distributors_${date}.csv`);

  toast.success("Distributor data exported successfully!");
};

// -------CSV handler end ------------
  // ─── Save Distributor (Add / Update) ─────────────────────
  const handleSave = async (e) => {
    e?.preventDefault();
    if (!formData.distributor_name || !formData.distributor_email) {
      toast.error("Name and Email are required!");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      if (isEditing) {
        await updateDistributorApi(formData.distributor_id, formData);
        toast.success("Distributor updated successfully!");
        setDistributors((prev) =>
          prev.map((d) =>
            d.distributor_id === formData.distributor_id ? formData : d
          )
        );
      } else {
        const response = await addDistributorApi(formData);
        const newDistributor = response.distributor;
        toast.success("Distributor added successfully!");
        setDistributors((prev) => [...prev, newDistributor]);
      }
      setIsDrawerOpen(false);
    } catch (error) {
      console.error("Error saving distributor:", error);
      toast.error(error.response?.data?.message || "Failed to save distributor.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Delete Distributor ──────────────────────────────────
  const handleDelete = (distributor) => {
    setDeleteTarget(distributor);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteDistributorApi(deleteTarget.distributor_id);
      toast.success("Distributor deleted successfully!");
      setDistributors((prev) =>
        prev.filter((d) => d.distributor_id !== deleteTarget.distributor_id)
      );
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error("Error deleting distributor:", error);
      toast.error("Failed to delete distributor.");
    }
  };

  // ─── Drawer Handling ─────────────────────────────────────
  const openDrawer = (distributor = null) => {
    if (distributor) {
      setFormData({ ...distributor });
      setIsEditing(true);
    } else {
      setFormData({
        distributor_id: "",
        distributor_name: "",
        distributor_company: "",
        distributor_region: "North-East",
        distributor_phone: "",
        distributor_email: "",
        distributor_contact: "",
        distributor_status: "Active",
        distributor_assignedProducts: 0,
        salesman_id: "",
      });
      setIsEditing(false);
    }
    setIsDrawerOpen(true);
  };

  // ─── View Distributor + Products ─────────────────────────
  const handleView = async (distributor) => {
    setViewDistributor(distributor);
    setIsViewModalOpen(true);
    setLoadingProducts(true);
    try {
      const allProducts = await getProductsApi();
      const assigned = allProducts.filter(
        (p) => p.Distributor_ID === distributor.distributor_id
      );
      const available = allProducts.filter(
        (p) => !p.Distributor_ID || p.Distributor_ID === null
      );
      setAssignedProducts(assigned);
      setAvailableProducts(available);
    } catch (error) {
      console.error("Error fetching products for distributor:", error);
      toast.error("Failed to fetch distributor products.");
    } finally {
      setLoadingProducts(false);
    }
  };

  // ─── Filtering ───────────────────────────────────────────
  const filteredDistributors = distributors.filter((d) => {
    const matchesSearch = d.distributor_name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRegion =
      filterRegion === "All" || d.distributor_region === filterRegion;
    const matchesStatus =
      filterStatus === "All" || d.distributor_status === filterStatus;
    return matchesSearch && matchesRegion && matchesStatus;
  });

  // ─── UI Rendering ────────────────────────────────────────
  return (
    <div className="p-8 bg-gray-950 min-h-screen text-white">
      <CustomToaster />

      {/* Header */}
      <motion.div
        className="flex flex-wrap items-center justify-between gap-4 mb-6"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-3xl font-bold text-indigo-400">Distributors</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => openDrawer()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md font-medium transition"
          >
            <FaPlus /> New Distributor
          </button>

<button
  onClick={handleExportDistributorsCSV}
  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-md font-medium transition"
>
  <FaDownload /> Import ⤓
</button>

        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="bg-gray-900/60 border border-gray-800 backdrop-blur-md p-4 rounded-lg mb-6 flex flex-wrap items-center gap-4"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={0.1}
      >
        <select
          className="bg-gray-800 text-gray-200 px-3 py-2 rounded-md border border-gray-700"
          value={filterRegion}
          onChange={(e) => setFilterRegion(e.target.value)}
        >
          <option value="All">Region: All</option>
          <option value="North-East">North-East</option>
          <option value="Mid-West">Mid-West</option>
          <option value="Pacific">Pacific</option>
        </select>

        <select
          className="bg-gray-800 text-gray-200 px-3 py-2 rounded-md border border-gray-700"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">Status: All</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <div className="flex items-center bg-gray-800 border border-gray-700 rounded-md px-3 py-2 flex-1 max-w-sm">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none text-gray-200 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        className="bg-gray-900/60 border border-gray-800 rounded-xl backdrop-blur-md overflow-x-auto shadow-lg"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={0.2}
      >
        <table className="w-full text-sm text-gray-300">
          <thead className="bg-gray-800/70 text-gray-200 border-b border-gray-700">
            <tr>
              <th className="p-3 text-left">Serial No</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Region</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-center">Assigned Products</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDistributors.length > 0 ? (
              filteredDistributors.map((d, index) => (
                <tr
                  key={d.distributor_id}
                  className="border-b border-gray-800 hover:bg-gray-800/40 transition"
                >
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{d.distributor_name}</td>
                  <td className="p-3">{d.distributor_region}</td>
                  <td className="p-3">{d.distributor_phone}</td>
                  <td className="p-3 flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        d.distributor_status === "Active"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    ></span>
                    <span>{d.distributor_status}</span>
                  </td>
                  <td className="p-3 text-center">
                    {d.distributor_assignedProducts}
                  </td>
                  <td className="p-3 text-center flex justify-center gap-3">
                    <button
                      onClick={() => openDrawer(d)}
                      className="text-indigo-400 hover:text-indigo-300 cursor-pointer"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(d)}
                      className="text-red-400 hover:text-red-300 cursor-pointer"
                    >
                      <FaTrash />
                    </button>
                    <button
                      onClick={() => handleView(d)}
                      className="text-yellow-400 hover:text-yellow-300 cursor-pointer"
                    >
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center text-gray-400 py-4 italic">
                  No distributors found 🚫
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>

      {/* Drawer Form */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
          <motion.div
            className="bg-gray-900 w-full sm:w-[500px] h-full p-6 border-l border-gray-800 shadow-2xl overflow-y-auto"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
          >
            <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-3">
              <h2 className="text-xl font-semibold text-indigo-400">
                {isEditing ? "Edit Distributor" : "New Distributor"}
              </h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="text-gray-400 hover:text-gray-200 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {[
                { label: "Name", name: "distributor_name", type: "text" },
                { label: "Company", name: "distributor_company", type: "text" },
                { label: "Phone", name: "distributor_phone", type: "text" },
                { label: "Email", name: "distributor_email", type: "email" },
                { label: "Contact Person", name: "distributor_contact", type: "text" },
                { label: "Assigned Products", name: "distributor_assignedProducts", type: "number" },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-gray-300 mb-1">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className="w-full bg-gray-800 px-3 py-2 rounded-md border border-gray-700 outline-none"
                  />
                </div>
              ))}
 {/* ─── Salesman Dropdown ─── */}
                <div>
                  <label className="block mb-1">Assign Salesman</label>
                  <select
                    name="salesman_id"
                    value={formData.salesman_id || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded border border-gray-700 bg-gray-800 outline-none"
                  >
                    <option value="">Select Salesman</option>
                    {salesmen.map((s) => (
                      <option key={s.Salesman_ID} value={s.Salesman_ID}>
                        {s.Salesman_name}
                      </option>
                    ))}
                  </select>
                </div>

              {/* Region */}
              <div>
                <label className="block text-gray-300 mb-1">Region</label>
                <select
                  name="distributor_region"
                  value={formData.distributor_region}
                  onChange={handleChange}
                  className="w-full bg-gray-800 px-3 py-2 rounded-md border border-gray-700 outline-none"
                >
                  <option value="North-East">North-East</option>
                  <option value="Mid-West">Mid-West</option>
                  <option value="Pacific">Pacific</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-gray-300 mb-1">Status</label>
                <select
                  name="distributor_status"
                  value={formData.distributor_status}
                  onChange={handleChange}
                  className="w-full bg-gray-800 px-3 py-2 rounded-md border border-gray-700 outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6 border-t border-gray-800 pt-4">
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded-md font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-md font-medium"
              >
                {loading ? "Saving..." : isEditing ? "Update" : "Save"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-gray-900 p-6 rounded-xl border border-gray-700 text-center max-w-sm w-full"
            >
              <h3 className="text-xl font-semibold text-red-400 mb-4">
                Delete Distributor
              </h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-white">
                  {deleteTarget?.distributor_name}
                </span>
                ?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


{/* View Distributor Modal (Right-Side Popup) */}
<AnimatePresence>
  {isViewModalOpen && viewDistributor && (
    <>
      {/* Background Overlay */}
      <motion.div
        className="fixed inset-0 bg-black/60 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsViewModalOpen(false)}
      />

      {/* Right Slide Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", duration: 0.4 }}
        className="fixed top-0 right-0 h-full w-full sm:w-[600px] bg-gray-900 text-gray-200 z-50 shadow-2xl border-l border-gray-700 overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-700 p-4 sticky top-0 bg-gray-900 z-10">
          <h2 className="text-2xl font-bold text-indigo-400">
            Distributor — {viewDistributor.distributor_name}
          </h2>
          <button
            onClick={() => setIsViewModalOpen(false)}
            className="text-gray-400 hover:text-gray-200 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Distributor Info */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <p><strong>Contact:</strong> {viewDistributor.distributor_contact}</p>
              <p><strong>Email:</strong> {viewDistributor.distributor_email}</p>
              <p><strong>Phone:</strong> {viewDistributor.distributor_phone}</p>
              <p><strong>Region:</strong> {viewDistributor.distributor_region}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`inline-flex items-center gap-1 ${
                    viewDistributor.distributor_status === "Active"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  ● {viewDistributor.distributor_status}
                </span>
              </p>
            </div>
          </div>

          {/* Assigned & Available Products */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Assigned Products */}
            <div className="bg-gray-800/40 border border-gray-700 rounded-lg p-3">
              <h4 className="font-semibold text-indigo-300 mb-2">
                Assigned Products ({assignedProducts.length})
              </h4>

              <input
                type="text"
                placeholder="Search assigned..."
                value={assignedSearch}
                onChange={(e) => setAssignedSearch(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-md px-2 py-1 mb-2 text-sm"
              />

              {loadingProducts ? (
                <p className="text-gray-400 text-sm italic">Loading...</p>
              ) : filteredAssigned.length > 0 ? (
                <div className="h-48 overflow-y-auto bg-gray-900 border border-gray-800 rounded-md p-2 text-sm space-y-1">
                  {filteredAssigned.map((p) => (
                    <div
                      key={p.Product_ID}
                      className="flex justify-between items-center hover:bg-gray-800 px-2 py-1 rounded-md"
                    >
                      <span>
                        {p.Product_name}{" "}
                        <span className="text-gray-500">({p.Product_sku})</span>
                      </span>
                      <button
                        className="text-red-400 hover:text-red-300 text-xs font-semibold"
                        onClick={() => handleRemoveProduct(p)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm italic">
                  No assigned products.
                </p>
              )}
            </div>

            {/* Available Products */}
            <div className="bg-gray-800/40 border border-gray-700 rounded-lg p-3">
              <h4 className="font-semibold text-indigo-300 mb-2">
                Available Products ({availableProducts.length})
              </h4>

              <input
                type="text"
                placeholder="Search available..."
                value={availableSearch}
                onChange={(e) => setAvailableSearch(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-md px-2 py-1 mb-2 text-sm"
              />

              {loadingProducts ? (
                <p className="text-gray-400 text-sm italic">Loading...</p>
              ) : filteredAvailable.length > 0 ? (
                <div className="h-48 overflow-y-auto bg-gray-900 border border-gray-800 rounded-md p-2 text-sm space-y-1">
                  {filteredAvailable.map((p) => (
                    <div
                      key={p.Product_ID}
                      className="flex justify-between items-center hover:bg-gray-800 px-2 py-1 rounded-md"
                    >
                      <span>
                        {p.Product_name}{" "}
                        <span className="text-gray-500">({p.Product_sku})</span>
                      </span>
                      <button
                        className="text-green-400 hover:text-green-300 text-xs font-semibold"
                        onClick={() => handleAddProduct(p)}
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm italic">
                  No available products.
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="mt-5">
            <label className="block mb-1 text-sm font-medium">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-sm h-20"
              placeholder="Write notes about this distributor..."
            ></textarea>
          </div>

          {/* Footer Buttons */}
<div className="flex justify-end gap-3 mt-6 border-t border-gray-800 pt-4">
  <button
    onClick={() => setIsViewModalOpen(false)}
    className="bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded-md font-medium"
  >
    Cancel
  </button>

  {/* Save Button */}
<button
  onClick={async () => {
    try {
      // Prepare payload with all required fields
      const payload = {
        distributor_name: (viewDistributor.distributor_name || "").trim(),
        distributor_company: viewDistributor.distributor_company || "",
        distributor_region: viewDistributor.distributor_region || "North-East",
        distributor_phone: viewDistributor.distributor_phone || "",
        distributor_email: (viewDistributor.distributor_email || "").trim(),
        distributor_contact: viewDistributor.distributor_contact || "",
        distributor_status: viewDistributor.distributor_status || "Active",
        distributor_assignedProducts: assignedProducts.length,
        assigned_products: assignedProducts.map((p) => p.Product_ID),
        notes: notes || "",
        salesman_id: viewDistributor.salesman_id || null,
      };

      // Call backend API
      await updateDistributorApi(viewDistributor.distributor_id, payload);

      toast.success("Distributor saved successfully!");
      setIsViewModalOpen(false);

      // Refresh distributor table
      fetchDistributors();
    } catch (error) {
      console.error("Save failed:", error);
      toast.error(
        error.response?.data?.message || "Failed to save distributor!"
      );
    }
  }}
  className="bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-md font-medium"
>
  Save
</button>

</div>
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>
    </div>
  );
};
export default Distributors;