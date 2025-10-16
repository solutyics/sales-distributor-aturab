import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaDownload, FaSearch, FaEdit, FaTrash, FaEye } from "react-icons/fa";
import toast from "react-hot-toast";
import {
  getSalesmenApi,
  addSalesmanApi,
  updateSalesmanApi,
  deleteSalesmanApi,
  getCustomersBySalesmanApi,
  getDistributorsBySalesmanApi,
  getUnassignedCustomersApi,   
  getUnassignedDistributorsApi,
  saveDistributorAssignmentsApi,
  saveCustomerAssignmentsApi,
} from "../Api/Api";
import CustomToaster from "../Components/CustomeToaster";

const Salesmen = () => {
  const [salesmen, setSalesmen] = useState([]);
  const [selectedSalesman, setSelectedSalesman] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRegion, setFilterRegion] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [viewSalesman, setViewSalesman] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  

  // FOr customer view modal
  const [assignedCustomers, setAssignedCustomers] = useState([]);
  const [availableCustomers, setAvailableCustomers] = useState([]);
  

const handleAssignCustomer = (cust) => {
  setAssignedCustomers([...assignedCustomers, cust]);
  setAvailableCustomers(availableCustomers.filter(c => c.Customer_ID !== cust.Customer_ID));
};

const handleUnassignCustomer = (cust) => {
  setAvailableCustomers([...availableCustomers, cust]);
  setAssignedCustomers(assignedCustomers.filter(c => c.Customer_ID !== cust.Customer_ID));
};


useEffect(() => {
  const fetchAllAssignments = async () => {
    if (!viewSalesman) {
      setAssignedCustomers([]);
      setAvailableCustomers([]);
      setAssignedDistributors([]);
      setAvailableDistributors([]);
      return;
    }

    try {

      // API calls for speed 
      const [assignedCustRes, unassignedCustRes, assignedDistRes, unassignedDistRes] = 
        await Promise.all([
          getCustomersBySalesmanApi(viewSalesman.Salesman_ID),
          getUnassignedCustomersApi(),
          getDistributorsBySalesmanApi(viewSalesman.Salesman_ID),
          getUnassignedDistributorsApi()
        ]);

      setAssignedCustomers(assignedCustRes.customers || []);
      setAvailableCustomers(unassignedCustRes.customers || []);
      setAssignedDistributors(assignedDistRes.distributors || []);
      setAvailableDistributors(unassignedDistRes.distributors || []);

    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast.error("Failed to load assignments!", { id: "loading" });
    }
  };

  fetchAllAssignments();
}, [viewSalesman]);


// distributor view modal start 
const [assignedDistributors, setAssignedDistributors] = useState([]);
const [availableDistributors, setAvailableDistributors] = useState([]);

const handleAssignDistributor = (dist) => {
  setAssignedDistributors([...assignedDistributors, dist]);
  setAvailableDistributors(
    availableDistributors.filter((d) => d.Distributor_ID !== dist.Distributor_ID)
  );
};

const handleUnassignDistributor = (dist) => {
  setAvailableDistributors([...availableDistributors, dist]);
  setAssignedDistributors(
    assignedDistributors.filter((d) => d.Distributor_ID !== dist.Distributor_ID)
  );
};


const [refresh, setRefresh] = useState(false);

// distributor view modal end

const saveAssignments = async () => {
  if (!viewSalesman) {
    toast.error("No salesman selected!");
    return;
  }

  try {
    
    const customerIds = assignedCustomers.map(c => c.Customer_ID);
    const distributorIds = assignedDistributors.map(d => d.Distributor_ID);

    console.log("Saving Customers:", customerIds); 
    console.log("Saving Distributors:", distributorIds); 

    // Parallel API calls
    const [customerRes, distributorRes] = await Promise.all([
      saveCustomerAssignmentsApi(viewSalesman.Salesman_ID, customerIds),
      saveDistributorAssignmentsApi(viewSalesman.Salesman_ID, distributorIds)
    ]);

    console.log("Customer Response:", customerRes); 
    console.log("Distributor Response:", distributorRes); 

    // Fetch updated counts immediately
    const [custRes, distRes] = await Promise.all([
      getCustomersBySalesmanApi(viewSalesman.Salesman_ID),
      getDistributorsBySalesmanApi(viewSalesman.Salesman_ID)
    ]);

    // Update the viewSalesman state with new counts
    setViewSalesman(prev => ({
      ...prev,
      Salesman_custs: custRes.count || 0,
      Salesman_distros: distRes.distributors.length || 0
    }));

    // Update the salesmen list with new counts
    setSalesmen(prevSalesmen => 
      prevSalesmen.map(s => 
        s.Salesman_ID === viewSalesman.Salesman_ID 
          ? { ...s, Salesman_custs: custRes.count || 0, Salesman_distros: distRes.distributors.length || 0 }
          : s
      )
    );

    toast.success("All assignments saved successfully!");
    
    // Refresh data
    const [assignedCustRes, unassignedCustRes, assignedDistRes, unassignedDistRes] = 
      await Promise.all([
        getCustomersBySalesmanApi(viewSalesman.Salesman_ID),
        getUnassignedCustomersApi(),
        getDistributorsBySalesmanApi(viewSalesman.Salesman_ID),
        getUnassignedDistributorsApi()
      ]);

    setAssignedCustomers(assignedCustRes.customers || []);
    setAvailableCustomers(unassignedCustRes.customers || []);
    setAssignedDistributors(assignedDistRes.distributors || []);
    setAvailableDistributors(unassignedDistRes.distributors || []);

    // Close the modal after saving
    setViewSalesman(null);

  } catch (error) {
    console.error("Error saving assignments:", error);
    console.error("Response:", error.response?.data); 
    
    toast.error(
      error.response?.data?.message || "Failed to save assignments!"
    );
  }
};



  // ─── Fetch All Salesmen ─────────────
  const fetchSalesmen = async () => {
    try {
      const data = await getSalesmenApi();
      setSalesmen(data);
    } catch {
      toast.error("Failed to fetch salesmen");
    }
  };

  useEffect(() => {
    fetchSalesmen();
  }, []);

  // ─── Save or Update Salesman ─────────────
const handleSaveSalesman = async (salesman, resetForm = false) => {
  // Trim string fields to avoid accidental whitespace
  const name = salesman.Salesman_name?.trim();
  const email = salesman.Salesman_email?.trim();
  const phone = salesman.Salesman_phone?.trim();
  const region = salesman.Salesman_region;
  const status = salesman.Salesman_status;

  // Validate required fields
  if (!name || !email || !phone || !region) {
    toast.error("Please fill all required fields!");
    return;
  }

  // Validate enums for region and status
  const validRegions = ["Pacific", "Mid-West", "North-East"];
  const validStatus = ["Active", "Inactive"];

  if (!validRegions.includes(region)) {
    toast.error(`Invalid region! Must be: ${validRegions.join(", ")}`);
    return;
  }
  if (!validStatus.includes(status)) {
    toast.error(`Invalid status! Must be: ${validStatus.join(", ")}`);
    return;
  }

  // Ensure numbers are valid integers
  const distros = Number(salesman.Salesman_distros);
  const custs = Number(salesman.Salesman_custs);
  if (isNaN(distros) || distros < 0) {
    toast.error("Distributors must be a valid non-negative number!");
    return;
  }
  if (isNaN(custs) || custs < 0) {
    toast.error("Customers must be a valid non-negative number!");
    return;
  }

const payload = {
  Salesman_name: name,
  Salesman_region: region,
  Salesman_email: email,
  Salesman_phone: phone,
  Salesman_distros: distros,
  Salesman_custs: custs,
  Salesman_status: status,
};

// Remove Salesman_ID if creating a new salesman
if (!salesman.Salesman_ID) {
  delete payload.Salesman_ID;
}

  console.log("Payload to send:", payload);

try {
  if (salesman.Salesman_ID) {
    // Update existing salesman
    await updateSalesmanApi(salesman.Salesman_ID, payload);
    toast.success("Salesman updated successfully!");
  } else {
    // Remove Salesman_ID for new salesman
    const { Salesman_ID, ...newPayload } = payload;
    await addSalesmanApi(newPayload);
    toast.success("New salesman added!");
  }
  fetchSalesmen();


    // Reset form if needed
    if (resetForm) {
      setSelectedSalesman({
        Salesman_name: "",
        Salesman_region: "Pacific",
        Salesman_email: "",
        Salesman_phone: "",
        Salesman_distros: 0,
        Salesman_custs: 0,
        Salesman_status: "Active",
      });
    } else {
      setSelectedSalesman(null);
    }
  } catch (error) {
    console.error("Error saving salesman:", error);
    toast.error(
      error.response?.data?.message || "Failed to save salesman"
    );
  }
};


  // ─── Delete Handlers ─────────────
  const handleDeleteClick = (salesman) => {
    setDeleteTarget(salesman);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSalesmanApi(deleteTarget.Salesman_ID);
      toast.success("Salesman deleted!");
      fetchSalesmen();
    } catch {
      toast.error("Failed to delete salesman");
    } finally {
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  // ─── Filters ─────────────
  const filteredSalesmen = salesmen.filter((s) => {
    const matchesSearch =
      s.Salesman_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.Salesman_ID.toString().toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = filterRegion === "All" || s.Salesman_region === filterRegion;
    const matchesStatus = filterStatus === "All" || s.Salesman_status === filterStatus;
    return matchesSearch && matchesRegion && matchesStatus;
  });

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay },
    }),
  };

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
  <h1 className="text-3xl font-bold text-indigo-400">Salesmen</h1>

  <div className="flex gap-2">
    <button
      onClick={() =>
        setSelectedSalesman({
          Salesman_name: "",
          Salesman_region: "Pacific",
          Salesman_email: "",
          Salesman_phone: "",
          Salesman_distros: 0,
          Salesman_custs: 0,
          Salesman_status: "Active",
        })
      }
      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md font-medium transition"
    >
      <FaPlus /> New Salesman
    </button>

    <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-md font-medium transition">
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
          <option value="Pacific">Pacific</option>
          <option value="Mid-West">Mid-West</option>
          <option value="North-East">North-East</option>
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
            placeholder="Search salesmen..."
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
              <th className="p-3 text-left">Email</th>
              {/* <th className="p-3 text-left">Phone</th> */}
              <th className="p-3 text-center">Distros</th>
              <th className="p-3 text-center">Custs</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
<tbody>
  {filteredSalesmen.length > 0 ? (
    filteredSalesmen.map((s, index) => (
      <tr
        key={s.Salesman_ID}
        className="border-b border-gray-800 hover:bg-gray-800/40 transition cursor-pointer"
      >
        <td className="p-3">{index + 1}</td>
        <td className="p-3">{s.Salesman_name}</td>
        <td className="p-3">{s.Salesman_region}</td>
        <td className="p-3">{s.Salesman_email}</td>
        <td className="p-3 text-center text-indigo-400 font-semibold">
          {s.Salesman_distros}
        </td>
        <td className="p-3 text-center text-indigo-400 font-semibold">
          {s.Salesman_custs}
        </td>
        <td className="p-3 text-center">
          {s.Salesman_status === "Active" ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-green-400 font-semibold">Active</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
              <span className="text-red-400 font-semibold">Inactive</span>
            </span>
          )}
        </td>
        <td className="p-3 text-center flex justify-center gap-3">
          <button
            onClick={() => setSelectedSalesman(s)}
            className="text-indigo-400 hover:text-indigo-300 cursor-pointer"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => handleDeleteClick(s)}
            className="text-red-400 hover:text-red-300 cursor-pointer"
          >
            <FaTrash />
          </button>
          <button
            onClick={() => setViewSalesman(s)}
            className="text-yellow-400 hover:text-yellow-300 cursor-pointer"
          >
            <FaEye />
          </button>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={8} className="p-3 text-center text-gray-400 italic">
        No Salesmen Found 🚫
      </td>
    </tr>
  )}
</tbody>

        </table>
      </motion.div>

      {/* Drawer Form */}
      <AnimatePresence>
        {selectedSalesman && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex justify-end z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-900 w-full sm:w-[500px] h-full p-6 border-l border-gray-800 shadow-2xl overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
            >
              <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-3">
                <h2 className="text-xl font-semibold text-indigo-400">
  {selectedSalesman.Salesman_ID
    ? `Edit Salesman ${selectedSalesman.Salesman_name}`
    : "New Salesman"}
</h2>

                <button
                  onClick={() => setSelectedSalesman(null)}
                  className="text-gray-400 hover:text-gray-200 text-lg"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-gray-300">
                <div>
                  <label className="block mb-1">Name</label>
                  <input
                    type="text"
                    value={selectedSalesman.Salesman_name}
                    onChange={(e) =>
                      setSelectedSalesman((prev) => ({
                        ...prev,
                        Salesman_name: e.target.value,
                      }))
                    }
                    className="w-full bg-gray-800 px-3 py-2 rounded-md border border-gray-700 text-gray-200"
                  />
                </div>
                <div>
                  <label className="block mb-1">Region</label>
<select
  value={selectedSalesman.Salesman_region}
  onChange={(e) =>
    setSelectedSalesman((prev) => ({
      ...prev,
      Salesman_region: e.target.value,
    }))
  }
  className="w-full bg-gray-800 px-3 py-2 rounded-md border border-gray-700 text-gray-200"
>
  <option value="" disabled>
    Select Region
  </option>
  <option value="Pacific">Pacific</option>
  <option value="Mid-West">Mid-West</option>
  <option value="North-East">North-East</option>
</select>



                </div>
                <div>
                  <label className="block mb-1">Email</label>
                  <input
                    type="email"
                    value={selectedSalesman.Salesman_email}
                    onChange={(e) =>
                      setSelectedSalesman((prev) => ({
                        ...prev,
                        Salesman_email: e.target.value,
                      }))
                    }
                    className="w-full bg-gray-800 px-3 py-2 rounded-md border border-gray-700 text-gray-200"
                  />
                </div>
                <div>
                  <label className="block mb-1">Phone</label>
                  <input
                    type="text"
                    value={selectedSalesman.Salesman_phone}
                    onChange={(e) =>
                      setSelectedSalesman((prev) => ({
                        ...prev,
                        Salesman_phone: e.target.value,
                      }))
                    }
                    className="w-full bg-gray-800 px-3 py-2 rounded-md border border-gray-700 text-gray-200"
                  />
                </div>
                <div>
                  <label className="block mb-1">Distributors</label>
                  <input
                    type="number"
                    value={selectedSalesman.Salesman_distros}
                    onChange={(e) =>
                      setSelectedSalesman((prev) => ({
                        ...prev,
                        Salesman_distros:
                          Number(e.target.value) || 0,
                      }))
                    }
                    className="w-full bg-gray-800 px-3 py-2 rounded-md border border-gray-700 text-gray-200"
                  />
                </div>
                <div>
                  <label className="block mb-1">Customers</label>
                  <input
                    type="number"
                    value={selectedSalesman.Salesman_custs}
                    onChange={(e) =>
                      setSelectedSalesman((prev) => ({
                        ...prev,
                        Salesman_custs: Number(e.target.value) || 0,
                      }))
                    }
                    className="w-full bg-gray-800 px-3 py-2 rounded-md border border-gray-700 text-gray-200"
                  />
                </div>
                <div>
                  <label className="block mb-1">Status</label>
                  <select
                    value={selectedSalesman.Salesman_status}
                    onChange={(e) =>
                      setSelectedSalesman((prev) => ({
                        ...prev,
                        Salesman_status: e.target.value,
                      }))
                    }
                    className="w-full bg-gray-800 px-3 py-2 rounded-md border border-gray-700 text-gray-200"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 border-t border-gray-800 pt-4">
                <button
                  onClick={() => setSelectedSalesman(null)}
                  className="bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded-md font-medium"
                >
                  Cancel
                </button>

                {selectedSalesman.Salesman_ID ? (
                  <button
                    onClick={() =>
                      handleSaveSalesman(selectedSalesman)
                    }
                    className="bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-md font-medium"
                  >
                    Update
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() =>
                        handleSaveSalesman(selectedSalesman)
                      }
                      className="bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-md font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={() =>
                        handleSaveSalesman(selectedSalesman, true)
                      }
                      className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-md font-medium"
                    >
                      Save & New
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
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
                Delete Salesman
              </h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-white">
                  {deleteTarget?.Salesman_name}
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

    {/* View Salesman Detail Modal */}
<AnimatePresence>
  {viewSalesman && (
    <motion.div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-gray-900 text-gray-200 w-[95%] max-w-7xl max-h-[95vh] overflow-y-auto rounded-xl border border-gray-700 shadow-2xl p-6"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
          <h2 className="text-2xl font-semibold text-indigo-400">
            Salesman — Detail (Assign Distributors & Customers)
          </h2>
          <button
            onClick={() => setViewSalesman(null)}
            className="text-gray-400 hover:text-gray-200 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Salesman Info */}
        <div className="bg-gray-800/50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-2">
            Salesman: <span className="text-indigo-400">{viewSalesman.Salesman_name}</span>
          </h3>
          <p>
            <span className="text-gray-400">Region:</span> {viewSalesman.Salesman_region} &nbsp;|&nbsp;
            <span className="text-gray-400">Email:</span> {viewSalesman.Salesman_email} &nbsp;|&nbsp;
            <span className="text-gray-400">Phone:</span> {viewSalesman.Salesman_phone}
          </p>
          <p className="mt-2">
            <span className="text-gray-400">Status:</span>{" "}
            {viewSalesman.Salesman_status === "Active" ? (
              <span className="inline-flex items-center gap-2 text-green-400">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-red-400">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Inactive
              </span>
            )}
          </p>
        </div>

 {/* ── Customers Section ── */}
  <div className="border border-gray-700 rounded-lg">
    <div className="bg-gray-800/60 px-4 py-2 border-b border-gray-700 flex justify-between items-center">
      <h3 className="text-xl font-semibold text-indigo-400">
        Customers Management
      </h3>
    </div>

    <div className="grid grid-cols-3 gap-4 p-4">
      {/* Assigned Customers */}
      <div>
        <h4 className="text-lg font-semibold mb-2">
          Assigned Customers ({assignedCustomers.length})
        </h4>
        <div className="bg-gray-900 rounded-md p-3 h-64 overflow-y-auto border border-gray-700">
          {assignedCustomers.length > 0 ? (
            assignedCustomers.map((cust) => (
              <div
                key={cust.Customer_ID}
                className="p-2 border-b border-gray-700 flex justify-between items-center"
              >
                <span>{cust.Customer_name}</span>
                <button
                  onClick={() => handleUnassignCustomer(cust)}
                  className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-sm"
                >
                  Remove
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm italic">No assigned customers</p>
          )}
        </div>
      </div>

      {/* Add/Remove Buttons */}
      <div className="flex flex-col items-center justify-center gap-4"></div>

      {/* Available Customers */}
      <div>
        <h4 className="text-lg font-semibold mb-2">
          Available Customers ({availableCustomers.length})
        </h4>
        <div className="bg-gray-900 rounded-md p-3 h-64 overflow-y-auto border border-gray-700">
          {availableCustomers.length > 0 ? (
            availableCustomers.map((cust) => (
              <div
                key={cust.Customer_ID}
                className="p-2 border-b border-gray-700 flex justify-between items-center"
              >
                <span>{cust.Customer_name}</span>
                <button
                  onClick={() => handleAssignCustomer(cust)}
                  className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-sm"
                >
                  Add
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm italic">No available customers</p>
          )}
        </div>
      </div>
    </div>
  </div>

  {/* ── Distributors Section ── */}
  <div className="border border-gray-700 rounded-lg">
    <div className="bg-gray-800/60 px-4 py-2 border-b border-gray-700 flex justify-between items-center">
      <h3 className="text-xl font-semibold text-indigo-400">
        Distributors Management
      </h3>
    </div>

    <div className="grid grid-cols-3 gap-4 p-4">
      {/* Assigned Distributors */}
      <div>
        <h4 className="text-lg font-semibold mb-2">
          Assigned Distributors ({assignedDistributors.length})
        </h4>
        <div className="bg-gray-900 rounded-md p-3 h-64 overflow-y-auto border border-gray-700">
          {assignedDistributors.length > 0 ? (
            assignedDistributors.map((dist) => (
              <div
                key={dist.Distributor_ID}
                className="p-2 border-b border-gray-700 flex justify-between items-center"
              >
                <span>{dist.Distributor_name}</span>
                <button
                  onClick={() => handleUnassignDistributor(dist)}
                  className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-sm"
                >
                  Remove
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm italic">No assigned distributors</p>
          )}
        </div>
      </div>

      {/* Add/Remove Buttons */}
      <div className="flex flex-col items-center justify-center gap-4"></div>

      {/* Available Distributors */}
      <div>
        <h4 className="text-lg font-semibold mb-2">
          Available Distributors ({availableDistributors.length})
        </h4>
        <div className="bg-gray-900 rounded-md p-3 h-64 overflow-y-auto border border-gray-700">
          {availableDistributors.length > 0 ? (
            availableDistributors.map((dist) => (
              <div
                key={dist.Distributor_ID}
                className="p-2 border-b border-gray-700 flex justify-between items-center"
              >
                <span>{dist.Distributor_name}</span>
                <button
                  onClick={() => handleAssignDistributor(dist)}
                  className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-sm"
                >
                  Add
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm italic">No available distributors</p>
          )}
        </div>
      </div>
    </div>
        </div>

        {/* Footer Buttons */}
<div className="flex justify-end gap-3 mt-6 border-t border-gray-700 pt-4">
  <button
    onClick={() => setViewSalesman(null)}
    className="bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded-md"
  >
    Cancel
  </button>
  <button
    onClick={saveAssignments}
    className="bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-md"
  >
    Save
  </button>
</div>

      </motion.div>
    </motion.div>
  )}
</AnimatePresence>


    </div>
  );
};

export default Salesmen;