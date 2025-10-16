import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaDownload, FaSearch, FaEdit, FaTrash, FaEye } from "react-icons/fa";
import toast from "react-hot-toast";
import { saveAs } from "file-saver";
import CustomToaster from "../Components/CustomeToaster";
import {
  getCustomersApi,
  addCustomerApi,
  updateCustomerApi,
  deleteCustomerApi,
  getSalesmenApi,
} from "../Api/Api";

const Customer = () => {
  const [customers, setCustomers] = useState([]);
  const [salesmen, setSalesmen] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState("All");
  const [regionFilter, setRegionFilter] = useState("All");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");


  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, delay },
    }),
  };

  // ─── Fetch Customers ─────────────
  const fetchCustomers = async () => {
    try {
      const data = await getCustomersApi();
      setCustomers(data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to load customers!");
    }
  };

  // ─── Fetch Salesmen ─────────────
  const fetchSalesmen = async () => {
    try {
      const data = await getSalesmenApi();
      setSalesmen(data);
    } catch (error) {
      console.error("Error fetching salesmen:", error);
      toast.error("Failed to load salesmen!");
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchSalesmen();
  }, []);
// --------end---------

  const openViewModal = (customer) => {
  setSelectedCustomer(customer);
  setIsViewOpen(true);
};


// csv file handler 
// ─── Export Customers to CSV ─────────────
const handleExportCSV = () => {
  if (customers.length === 0) {
    toast.error("No customers available to export!");
    return;
  }

  // Define CSV headers
  const headers = [
    "Serial No",
    "Customer Name",
    "City",
    "Region",
    "Tier",
    "Salesman",
    "Status",
  ];

  // Build CSV rows
  const rows = customers.map((c, index) => {
    const assignedSalesman =
      salesmen.find((s) => s.Salesman_ID === c.Salesman_ID)?.Salesman_name || "—";

    return [
      index + 1,
      `"${c.Customer_name || ""}"`,
      `"${c.Customer_city || ""}"`,
      `"${c.Customer_region || ""}"`,
      `"${c.Customer_tier || ""}"`,
      `"${assignedSalesman}"`,
      `"${c.Customer_status || ""}"`,
    ].join(",");
  });

  // Join everything into one CSV string
  const csvContent = [headers.join(","), ...rows].join("\n");

  // Create blob and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, "customers_data.csv");

  toast.success("Customer data exported successfully!");
};

// csv file handler end 

  // ─── Handle Add / Edit ─────────────
  const handleAddOrEdit = async (e, stayOpen = false) => {
    e.preventDefault();

    const payload = {
      ...selectedCustomer,
      customer_salesmen: selectedCustomer?.customer_salesmen || [],
    };

    try {
      if (isEditing) {
        await updateCustomerApi(selectedCustomer.Customer_ID, payload);
        toast.success("Customer updated successfully!");
        setIsModalOpen(false);
      } else {
        payload.Customer_ID = crypto.randomUUID();
        await addCustomerApi(payload);
        toast.success("Customer added successfully!");
        fetchCustomers();

        if (stayOpen) {
          // Clear form but keep modal open
          setSelectedCustomer({
            Customer_name: "",
            Customer_city: "",
            Customer_region: "North-East",
            Customer_tier: "A",
            customer_salesmen: [],
            Customer_contact: "",
            Customer_email: "",
            Customer_phone: "",
            Customer_address: "",
            Customer_notes: "",
            Customer_status: "Active",
          });
          return; // Stop further execution
        } else {
          setIsModalOpen(false);
        }
      }

      fetchCustomers();
    } catch (error) {
      console.error("Error saving customer:", error);
      toast.error("Failed to save customer!");
    }
  };

  // ─── Delete Logic ─────────────
  const handleDeleteClick = (customer) => {
    setDeleteTarget(customer);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCustomerApi(deleteTarget.Customer_ID);
      toast.success("Customer deleted successfully!");
      fetchCustomers();
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("Failed to delete customer!");
    } finally {
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  // ─── Open Modal ─────────────
  const openModal = (customer = null) => {
    setSelectedCustomer(
      customer || {
        Customer_name: "",
        Customer_city: "",
        Customer_region: "North-East",
        Customer_tier: "A",
        customer_salesmen: [],
        Customer_contact: "",
        Customer_email: "",
        Customer_phone: "",
        Customer_address: "",
        Customer_notes: "",
        Customer_status: "Active",
      }
    );
    setIsEditing(!!customer);
    setIsModalOpen(true);
  };

  // ─── Filters + Search ─────────────
  const filteredCustomers = customers.filter((c) => {
    const matchSearch = c.Customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTier = tierFilter === "All" || c.Customer_tier === tierFilter;
    const matchRegion = regionFilter === "All" || c.Customer_region === regionFilter;
      const matchStatus = filterStatus === "All" || c.Customer_status === filterStatus;
    return matchSearch && matchTier && matchRegion && matchStatus;
  });

  return (
    <div className="p-8 bg-gray-950 min-h-screen text-white">
      <CustomToaster />

      {/* ─── Header ───────────── */}
      <motion.div
        className="flex flex-wrap items-center justify-between gap-4 mb-6"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-3xl font-bold text-indigo-400">Customers</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md font-medium transition"
          >
            <FaPlus /> New Customer
          </button>
<button
  onClick={handleExportCSV}
  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-md font-medium transition"
>
  <FaDownload /> Import ⤓
</button>
        </div>
      </motion.div>

      {/* ─── Filters ───────────── */}
      <motion.div
        className="bg-gray-900/60 border border-gray-800 backdrop-blur-md p-4 rounded-lg mb-6 flex flex-wrap items-center gap-4"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="bg-gray-800 text-gray-200 px-3 py-2 rounded-md border border-gray-700"
        >
          <option value="All">Tier: All</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
        </select>

        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="bg-gray-800 text-gray-200 px-3 py-2 rounded-md border border-gray-700"
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
            placeholder="Search by name, city..."
            className="bg-transparent outline-none text-gray-200 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </motion.div>

{/* ─── Table ───────────── */}
<motion.div
  className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-x-auto shadow-lg"
  variants={fadeUp}
  initial="hidden"
  animate="visible"
>
  <table className="w-full text-sm text-gray-300">
    <thead className="bg-gray-800/70 text-gray-200 border-b border-gray-700">
      <tr>
        <th className="p-3 text-left">Serial No</th>
        <th className="p-3 text-left">Name</th>
        <th className="p-3 text-left">City</th>
        <th className="p-3 text-left">Region</th>
        <th className="p-3 text-center">Tier</th>
        <th className="p-3 text-center">Assigned Salesman</th> {/* New Column */}
        <th className="p-3 text-center">Status</th>
        <th className="p-3 text-center">Actions</th>
      </tr>
    </thead>

    <tbody>
      {filteredCustomers.length > 0 ? (
        filteredCustomers.map((c, index) => {
          const assignedSalesman =
            salesmen.find((s) => s.Salesman_ID === c.Salesman_ID)?.Salesman_name || "—";
          return (
            <tr
              key={c.Customer_ID}
              className="border-b border-gray-800 hover:bg-gray-800/40 transition"
            >
              <td className="p-3">{index + 1}</td>
              <td className="p-3">{c.Customer_name}</td>
              <td className="p-3">{c.Customer_city}</td>
              <td className="p-3">{c.Customer_region}</td>
              <td className="p-3 text-center text-indigo-400 font-semibold">
                {c.Customer_tier}
              </td>
              <td className="p-3 text-center text-gray-300">
                {assignedSalesman}
              </td>
              <td className="p-3 text-center">
                <div className="inline-flex items-center gap-2 justify-center">
                  <span
                    className={`inline-block w-3 h-3 rounded-full ${
                      c.Customer_status === "Active"
                        ? "bg-green-400"
                        : "bg-red-400"
                    }`}
                  />
                  <span className="text-sm text-gray-200">
                    {c.Customer_status}
                  </span>
                </div>
              </td>
              <td className="p-3 text-center flex items-center justify-center gap-3">
                <button
                  onClick={() => openModal(c)}
                  className="text-indigo-400 hover:text-indigo-300 cursor-pointer"
                  title="Edit"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteClick(c)}
                  className="text-red-400 hover:text-red-300 cursor-pointer"
                  title="Delete"
                >
                  <FaTrash />
                </button>
                <button
                  onClick={() => openViewModal(c)}
                  className="text-yellow-400 hover:text-yellow-300 cursor-pointer"
                  title="View"
                >
                  <FaEye />
                </button>
              </td>
            </tr>
          );
        })
      ) : (
        <tr>
          <td colSpan="8" className="text-center p-4 text-gray-500">
            No customers found 🚫
          </td>
        </tr>
      )}
    </tbody>
  </table>
</motion.div>


{/* ─── Drawer Form ───────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-[0.5px] bg-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              className="fixed right-0 top-0 h-full w-[550px] bg-gray-900 text-white shadow-2xl z-50 overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 80 }}
            >
              <div className="p-6">
                <h2 className="text-2xl font-semibold text-indigo-400 mb-4">
                  {isEditing ? "Edit Customer" : "Add New Customer"}
                </h2>

                <form onSubmit={(e) => handleAddOrEdit(e, false)} className="flex flex-col gap-3">
                  <input type="text" placeholder="Customer Name" value={selectedCustomer.Customer_name} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, Customer_name: e.target.value })} required className="bg-gray-800 border border-gray-700 rounded p-2 focus:ring-2 focus:ring-indigo-500 outline-none"/>
                  <input type="text" placeholder="City" value={selectedCustomer.Customer_city} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, Customer_city: e.target.value })} required className="bg-gray-800 border border-gray-700 rounded p-2 focus:ring-2 focus:ring-indigo-500 outline-none"/>
                  <select value={selectedCustomer.Customer_region} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, Customer_region: e.target.value })} className="bg-gray-800 border border-gray-700 rounded p-2 focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option>North-East</option>
                    <option>Mid-West</option>
                    <option>Pacific</option>
                  </select>
                  <select value={selectedCustomer.Customer_tier} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, Customer_tier: e.target.value })} className="bg-gray-800 border border-gray-700 rounded p-2 focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option>A</option>
                    <option>B</option>
                    <option>C</option>
                  </select>
                  <select value={selectedCustomer.Customer_status} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, Customer_status: e.target.value })} className="bg-gray-800 border border-gray-700 rounded p-2 focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                  <select value={selectedCustomer.Salesman_ID || ""} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, Salesman_ID: e.target.value })} className="bg-gray-800 border border-gray-700 rounded p-2 focus:ring-2 focus:ring-indigo-500 outline-none" required>
                    <option value="">Select Salesman</option>
                    {salesmen.map((s) => (
                      <option key={s.Salesman_ID} value={s.Salesman_ID}>{s.Salesman_name}</option>
                    ))}
                  </select>
                  <input type="text" placeholder="Contact" value={selectedCustomer.Customer_contact} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, Customer_contact: e.target.value })} required className="bg-gray-800 border border-gray-700 rounded p-2 focus:ring-2 focus:ring-indigo-500 outline-none"/>
                  <input type="email" placeholder="Email" value={selectedCustomer.Customer_email} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, Customer_email: e.target.value })} className="bg-gray-800 border border-gray-700 rounded p-2 focus:ring-2 focus:ring-indigo-500 outline-none"/>
                  <input type="text" placeholder="Phone" value={selectedCustomer.Customer_phone} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, Customer_phone: e.target.value })} className="bg-gray-800 border border-gray-700 rounded p-2 focus:ring-2 focus:ring-indigo-500 outline-none"/>
                  <textarea placeholder="Address" value={selectedCustomer.Customer_address} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, Customer_address: e.target.value })} className="bg-gray-800 border border-gray-700 rounded p-2 focus:ring-2 focus:ring-indigo-500 outline-none"/>
                  <textarea placeholder="Notes" value={selectedCustomer.Customer_notes} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, Customer_notes: e.target.value })} className="bg-gray-800 border border-gray-700 rounded p-2 focus:ring-2 focus:ring-indigo-500 outline-none"/>

                  <div className="flex justify-end gap-3 mt-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md">Cancel</button>
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-md font-medium">{isEditing ? "Update" : "Save"}</button>
                    {!isEditing && <button type="button" onClick={(e) => handleAddOrEdit(e, true)} className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-md font-medium">Save & New</button>}
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Delete Confirmation ───────────── */}
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
                Delete Customer
              </h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-white">
                  {deleteTarget?.Customer_name}
                </span>
                ?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-md"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
       </AnimatePresence>


<AnimatePresence>
  {isViewOpen && selectedCustomer && (
    <div className="fixed inset-0 flex justify-end z-50">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsViewOpen(false)}
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", duration: 0.3 }}
        className="relative bg-gray-900 w-full sm:w-[600px] h-full p-6 border-l border-gray-800 shadow-2xl overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-3">
          <h2 className="text-xl font-semibold text-indigo-400">
            Customer — {selectedCustomer.Customer_name}
          </h2>
          <button
            onClick={() => setIsViewOpen(false)}
            className="text-gray-400 hover:text-gray-200 text-lg"
          >
            ✕
          </button>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-2 gap-4 text-gray-200">
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Contact:</label>
            <input
              type="text"
              value={selectedCustomer.Customer_contact || ""}
              readOnly
              className="bg-gray-800 px-3 py-2 rounded-md border border-gray-700"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">Email:</label>
            <input
              type="text"
              value={selectedCustomer.Customer_email || ""}
              readOnly
              className="bg-gray-800 px-3 py-2 rounded-md border border-gray-700"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">Phone:</label>
            <input
              type="text"
              value={selectedCustomer.Customer_phone || ""}
              readOnly
              className="bg-gray-800 px-3 py-2 rounded-md border border-gray-700"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">Address:</label>
            <input
              type="text"
              value={selectedCustomer.Customer_address || ""}
              readOnly
              className="bg-gray-800 px-3 py-2 rounded-md border border-gray-700"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">Tier:</label>
            <input
              type="text"
              value={selectedCustomer.Customer_tier || ""}
              readOnly
              className="bg-gray-800 px-3 py-2 rounded-md border border-gray-700"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">Status:</label>
            <input
              type="text"
              value={selectedCustomer.Customer_status || ""}
              readOnly
              className="bg-gray-800 px-3 py-2 rounded-md border border-gray-700"
            />
          </div>

<div className="flex flex-col col-span-2">
  <label className="font-semibold mb-1">Assigned Salesman:</label>
  <input
    type="text"
    value={
      salesmen.find((s) => s.Salesman_ID === selectedCustomer.Salesman_ID)?.Salesman_name ||
      "No Salesman Assigned"
    }
    readOnly
    className={`bg-gray-800 px-3 py-2 rounded-md border ${
      selectedCustomer.Salesman_ID ? "border-gray-700" : "border-red-500 text-red-400"
    }`}
  />
</div>



          <div className="flex flex-col col-span-2">
            <label className="font-semibold mb-1">Notes:</label>
            <textarea
              value={selectedCustomer.Customer_notes || ""}
              readOnly
              rows={4}
              className="bg-gray-800 px-3 py-2 rounded-md border border-gray-700 resize-none"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6 border-t border-gray-800 pt-4">
          <button
            onClick={() => setIsViewOpen(false)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>


     </div>
  );
};

export default Customer;