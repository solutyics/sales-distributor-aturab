import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaDownload, FaEdit, FaTrash, FaSearch, FaEye} from "react-icons/fa";
import {
  getProductsApi,
  addProductApi,
  updateProductApi,
  deleteProductApi,
  getDistributorsApi, 
} from "../Api/Api";
import CustomToaster from "../Components/CustomeToaster";
import { toast } from "react-hot-toast";
import { saveAs } from "file-saver";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDrawer, setShowDrawer] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);


  const [filters, setFilters] = useState({
    category: "All",
    status: "All",
    stock: "",
  });

  const [productForm, setProductForm] = useState({
    Product_ID: "",
    Distributor_ID: "",
    Product_name: "",
    Product_sku: "",
    Product_category: "Widgets",
    Product_price: "",
    Product_stock: "",
    Product_status: "Active",
    Product_description: "",
  });

  // Fetch products and distributors
  useEffect(() => {
    fetchProducts();
    fetchDistributors();
  }, []);

  // for eye/view button
  const handleViewClick = (product) => {
  setViewProduct(product);
  setShowViewModal(true);
};
// ─── Export Products to CSV ─────────────
const handleExportProductsCSV = () => {
  if (products.length === 0) {
    toast.error("No products available to export!");
    return;
  }

  // Define CSV headers
  const headers = [
    "Serial No",
    "Product Name",
    "SKU",
    "Category",
    "Price",
    "Stock",
    "Status",
  ];

  // Map each product to CSV rows
  const rows = products.map((p, index) => {
    const distributorName =
      distributors.find((d) => d.distributor_id === p.Distributor_ID)?.distributor_name || "—";

    return [
      index + 1,
      `"${p.Product_name || ""}"`,
      `"${p.Product_sku || ""}"`,
      `"${p.Product_category || ""}"`,
      `"${p.Product_price || ""}"`,
      `"${p.Product_stock || ""}"`,
      `"${p.Product_status || ""}"`,
    ].join(",");
  });

  // Combine headers and rows
  const csvContent = [headers.join(","), ...rows].join("\n");

  // Create and download CSV file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const date = new Date().toISOString().split("T")[0];
  saveAs(blob, `products_${date}.csv`);

  toast.success("Product data exported successfully!");
};

// -----CSV handler end --------
  const fetchProducts = async () => {
    try {
      const res = await getProductsApi();
      setProducts(res);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products!");
    }
  };

  const fetchDistributors = async () => {
    try {
      const res = await getDistributorsApi();
      setDistributors(res);
    } catch (error) {
      console.error("Error fetching distributors:", error);
      toast.error("Failed to fetch distributors!");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProduct = async (resetForm = false) => {
    if (
      !productForm.Product_name ||
      !productForm.Product_sku ||
      !productForm.Product_price ||
      !productForm.Distributor_ID
    ) {
      toast.error("Please fill all required fields!");
      return;
    }

    try {
      if (isEditing) {
        const res = await updateProductApi(currentProduct.Product_ID, productForm);
        toast.success(res.message || "Product updated successfully!");
        setProducts((prev) =>
          prev.map((p) => (p.Product_ID === currentProduct.Product_ID ? res.product : p))
        );
      } else {
        const res = await addProductApi(productForm);
        toast.success(res.message || "Product added successfully!");
        setProducts((prev) => [...prev, res.product]);
      }

      if (resetForm) {
        resetFormFunction();
        setShowDrawer(true);
      } else {
        resetFormFunction();
      }
    } catch (error) {
      console.error("Failed to save product:", error);
      toast.error("Failed to save product!");
    }
  };

  const handleEditClick = (product) => {
    setIsEditing(true);
    setCurrentProduct(product);
    setProductForm(product);
    setShowDrawer(true);
  };

  const handleDeleteClick = (product) => {
    setDeleteTarget(product);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteProductApi(deleteTarget.Product_ID);
      toast.success("Product deleted successfully!");
      setShowDeleteConfirm(false);
      setProducts((prev) => prev.filter((p) => p.Product_ID !== deleteTarget.Product_ID));
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Failed to delete product!");
    }
  };

  const resetFormFunction = () => {
    setProductForm({
      Product_ID: "",
      Distributor_ID: "",
      Product_name: "",
      Product_sku: "",
      Product_category: "Widgets",
      Product_price: "",
      Product_stock: "",
      Product_status: "Active",
      Product_description: "",
    });
    setShowDrawer(false);
    setIsEditing(false);
    setCurrentProduct(null);
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.Product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.Product_sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filters.category === "All" || p.Product_category === filters.category;
    const matchesStatus = filters.status === "All" || p.Product_status === filters.status;
    const matchesStock = filters.stock === "" || p.Product_stock <= parseInt(filters.stock);
    return matchesSearch && matchesCategory && matchesStatus && matchesStock;
  });

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (delay = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay } }),
  };

  return (
    <div className="p-8 bg-gray-950 min-h-screen text-white">
      <CustomToaster />

      {/* Header */}
      <motion.div className="flex flex-wrap items-center justify-between gap-4 mb-6" variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="text-3xl font-bold text-indigo-400">Products</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { resetFormFunction(); setShowDrawer(true); }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md font-medium transition"
          >
            <FaPlus /> New Product
          </button>

<button
  onClick={handleExportProductsCSV}
  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-md font-medium transition"
>
  <FaDownload /> Import ⤓
</button>


        </div>
      </motion.div>

      {/* Filters */}
      <motion.div className="bg-gray-900/60 border border-gray-800 backdrop-blur-md p-4 rounded-lg mb-6 flex flex-wrap items-center gap-4" variants={fadeUp} initial="hidden" animate="visible" custom={0.1}>
        <select value={filters.category} onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))} className="bg-gray-800 text-gray-200 px-3 py-2 rounded-md border border-gray-700">
          <option value="All">Category: All</option>
          <option value="Widgets">Widgets</option>
          <option value="Cables">Cables</option>
          <option value="Adapters">Adapters</option>
        </select>
        <select value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))} className="bg-gray-800 text-gray-200 px-3 py-2 rounded-md border border-gray-700">
          <option value="All">Status: All</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <input type="number" value={filters.stock} onChange={(e) => setFilters((prev) => ({ ...prev, stock: e.target.value }))} placeholder="Stock ≤" className="bg-gray-800 text-gray-200 px-3 py-2 rounded-md w-24 border border-gray-700" />
        <div className="flex items-center bg-gray-800 border border-gray-700 rounded-md px-3 py-2 flex-1 max-w-sm">
          <FaSearch className="text-gray-400 mr-2" />
          <input type="text" placeholder="Search..." className="bg-transparent outline-none text-gray-200 w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </motion.div>

      {/* Product Table */}
      <motion.div className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-x-auto shadow-lg" variants={fadeUp} initial="hidden" animate="visible">
        <table className="w-full text-sm text-gray-300">
          <thead className="bg-gray-800 text-gray-200 border-b border-gray-700">
            <tr>
              <th className="p-3 text-left">Serial No</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">SKU</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-right">Price</th>
              <th className="p-3 text-right">Stock</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
<tbody>
  {filteredProducts.length > 0 ? (
    filteredProducts.map((p, index) => (
      <tr key={p.Product_ID} className="border-b border-gray-800 hover:bg-gray-800/40">
        <td className="p-3">{index + 1}</td>
        <td className="p-3">{p.Product_name}</td>
        <td className="p-3">{p.Product_sku}</td>
        <td className="p-3">{p.Product_category}</td>
        <td className="p-3 text-right">${p.Product_price}</td>
        <td className="p-3 text-right">{p.Product_stock}</td>
        <td className="p-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <span
              className={`h-3 w-3 rounded-full ${
                p.Product_status === "Active" ? "bg-green-500" : "bg-red-500"
              }`}
            ></span>
            <span>{p.Product_status}</span>
          </div>
        </td>
        <td className="p-3 text-center flex justify-center gap-3">
          <button
            onClick={() => handleEditClick(p)}
            className="text-blue-400 hover:text-blue-200 cursor-pointer"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => handleDeleteClick(p)}
            className="text-red-400 hover:text-red-200 cursor-pointer"
          >
            <FaTrash />
          </button>
          <button
            onClick={() => handleViewClick(p)}
            className="text-yellow-400 hover:text-yellow-300 cursor-pointer"
          >
            <FaEye />
          </button>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="8" className="p-6 text-center text-gray-400">
        No products found 🚫
      </td>
    </tr>
  )}
</tbody>

        </table>
      </motion.div>

      {/* Drawer */}
<AnimatePresence>
  {showDrawer && (
    <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        className="bg-gray-900 w-full sm:w-[600px] h-full p-6 border-l border-gray-800 shadow-2xl overflow-y-auto flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-3">
          <h2 className="text-xl font-semibold text-indigo-400">
            {isEditing ? `Edit Product — ${currentProduct?.Product_name}` : "New Product"}
          </h2>
          <button onClick={resetFormFunction} className="text-gray-400 hover:text-gray-200 text-lg">✕</button>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-2 gap-4">
          <select
            name="Distributor_ID"
            value={productForm.Distributor_ID}
            onChange={handleInputChange}
            className="bg-gray-800 px-3 py-2 rounded-md border border-gray-700 col-span-2"
          >
            <option value="">Select Distributor</option>
            {distributors.map((d) => (
              <option key={d.distributor_id} value={d.distributor_id}>
                {d.distributor_name}
              </option>
            ))}
          </select>

          <input type="text" name="Product_name" placeholder="Product Name" value={productForm.Product_name} onChange={handleInputChange} className="bg-gray-800 px-3 py-2 rounded-md border border-gray-700 col-span-2" />
          <input type="text" name="Product_sku" placeholder="SKU" value={productForm.Product_sku} onChange={handleInputChange} className="bg-gray-800 px-3 py-2 rounded-md border border-gray-700" />
          <select name="Product_category" value={productForm.Product_category} onChange={handleInputChange} className="bg-gray-800 px-3 py-2 rounded-md border border-gray-700">
            <option>Widgets</option>
            <option>Cables</option>
            <option>Adapters</option>
          </select>
          <input type="number" name="Product_price" placeholder="Price" value={productForm.Product_price} onChange={handleInputChange} className="bg-gray-800 px-3 py-2 rounded-md border border-gray-700" />
          <input type="number" name="Product_stock" placeholder="Stock" value={productForm.Product_stock} onChange={handleInputChange} className="bg-gray-800 px-3 py-2 rounded-md border border-gray-700" />
          <select name="Product_status" value={productForm.Product_status} onChange={handleInputChange} className="bg-gray-800 px-3 py-2 rounded-md border border-gray-700">
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <textarea name="Product_description" placeholder="Description" rows="3" value={productForm.Product_description} onChange={handleInputChange} className="bg-gray-800 px-3 py-2 rounded-md border border-gray-700 col-span-2"></textarea>
        </div>

        {/* Drawer Footer */}
        <div className="flex justify-end gap-3 mt-6 border-t border-gray-800 pt-4">
          <button onClick={resetFormFunction} className="bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded-md">Cancel</button>
          <button onClick={() => handleSaveProduct(false)} className="bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-md font-medium">
            {isEditing ? "Update" : "Save"}
          </button>
          {!isEditing && (
            <button onClick={() => handleSaveProduct(true)} className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-md font-medium">
              Save & New
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>


      {/* Delete Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} className="bg-gray-900 p-6 rounded-xl border border-gray-700 text-center max-w-sm w-full">
              <h3 className="text-xl font-semibold text-red-400 mb-4">Delete Product</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete <span className="font-semibold text-white">{deleteTarget?.Product_name}</span>?
              </p>
              <div className="flex justify-center gap-4">
                <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md">Cancel</button>
                <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

<AnimatePresence>
  {showViewModal && (
    <div className="fixed inset-0 flex justify-end z-50">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowViewModal(false)}
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", duration: 0.3 }}
        className="relative bg-gray-900 w-full sm:w-[600px] h-full p-6 border-l border-gray-800 shadow-2xl overflow-y-auto flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-3">
          <h2 className="text-xl font-semibold text-indigo-400">Product — {viewProduct.Product_name}</h2>
          <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-200 text-lg">✕</button>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-2 gap-4 text-gray-200 flex-1">
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Name:</label>
            <input type="text" value={viewProduct.Product_name} readOnly className="bg-gray-800 px-3 py-2 rounded-md border border-gray-700" />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">SKU:</label>
            <input type="text" value={viewProduct.Product_sku} readOnly className="bg-gray-800 px-3 py-2 rounded-md border border-gray-700" />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">Category:</label>
            <input type="text" value={viewProduct.Product_category} readOnly className="bg-gray-800 px-3 py-2 rounded-md border border-gray-700" />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">Price:</label>
            <input type="text" value={`$${viewProduct.Product_price}`} readOnly className="bg-gray-800 px-3 py-2 rounded-md border border-gray-700" />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">Status:</label>
            <input type="text" value={viewProduct.Product_status} readOnly className="bg-gray-800 px-3 py-2 rounded-md border border-gray-700" />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">Stock:</label>
            <input type="text" value={viewProduct.Product_stock} readOnly className="bg-gray-800 px-3 py-2 rounded-md border border-gray-700" />
          </div>

          <div className="flex flex-col col-span-2">
            <label className="font-semibold mb-1">Description:</label>
            <textarea value={viewProduct.Product_description} readOnly rows={4} className="bg-gray-800 px-3 py-2 rounded-md border border-gray-700 resize-none"></textarea>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="mt-6 border-t border-gray-700 pt-4 w-full flex justify-end">
          <button
            onClick={() => setShowViewModal(false)}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
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

export default Products;