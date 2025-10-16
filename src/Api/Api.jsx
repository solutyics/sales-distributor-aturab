  import axios from "axios";

  const ApiUrl = import.meta.env.VITE_APP_BASE_URL;

// Get All Products
export const getProductsApi = async () => {
  try {
    const res = await axios.get(`${ApiUrl}/api/products`);
    return res.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

// Get Single Product by ID
export const getProductByIdApi = async (id) => {
  try {
    const res = await axios.get(`${ApiUrl}/api/products/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};

// Add New Product
export const addProductApi = async (productData) => {
  try {
    const res = await axios.post(`${ApiUrl}/api/products`, productData);
    return res.data;
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};

// Update Product by ID
export const updateProductApi = async (id, updatedData) => {
  try {
    const res = await axios.put(`${ApiUrl}/api/products/${id}`, updatedData);
    return res.data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

// Delete Product by ID
export const deleteProductApi = async (id) => {
  try {
    const res = await axios.delete(`${ApiUrl}/api/products/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};


// ------------------Distributor API call--------------------

// Add New Distributor
export const addDistributorApi = async (distributorData) => {
  try {
    const res = await axios.post(`${ApiUrl}/api/distributors`, distributorData);
    return res.data;
  } catch (error) {
    console.error("Error adding distributor:", error);
    throw error;
  }
};

// Get All Distributors
export const getDistributorsApi = async () => {
  try {
    const res = await axios.get(`${ApiUrl}/api/distributors`);
    return res.data;
  } catch (error) {
    console.error("Error fetching distributors:", error);
    throw error;
  }
};

// Update Distributor by ID
export const updateDistributorApi = async (id, updatedData) => {
  try {
    const res = await axios.put(`${ApiUrl}/api/distributors/${id}`, updatedData);
    return res.data;
  } catch (error) {
    console.error("Error updating distributor:", error);
    throw error;
  }
};

// Delete Distributor by ID
export const deleteDistributorApi = async (id) => {
  try {
    const res = await axios.delete(`${ApiUrl}/api/distributors/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting distributor:", error);
    throw error;
  }
};

// ------------------Customer API call--------------------

// Get All Customers
export const getCustomersApi = async () => {
  try {
    const res = await axios.get(`${ApiUrl}/api/customers`);
    return res.data;
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }
};

// Add New Customer
export const addCustomerApi = async (customerData) => {
  try {
    const res = await axios.post(`${ApiUrl}/api/customers`, customerData);
    return res.data;
  } catch (error) {
    console.error("Error adding customer:", error);
    throw error;
  }
};

// Update Customer
export const updateCustomerApi = async (id, customerData) => {
  try {
    const res = await axios.put(`${ApiUrl}/api/customers/${id}`, customerData);
    return res.data;
  } catch (error) {
    console.error("Error updating customer:", error);
    throw error;
  }
};

// Delete Customer
export const deleteCustomerApi = async (id) => {
  try {
    const res = await axios.delete(`${ApiUrl}/api/customers/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting customer:", error);
    throw error;
  }
};

// ------------------Salesmen API call--------------------

  // Get all salesmen
  export const getSalesmenApi = async () => {
    try {
      const res = await axios.get(`${ApiUrl}/api/salesmen`);
      return res.data;
    } catch (error) {
      console.error("Error fetching salesmen:", error);
      throw error;
    }
  };

  // Add new salesman
  export const addSalesmanApi = async (salesmanData) => {
    try {
      const res = await axios.post(`${ApiUrl}/api/salesmen`, salesmanData);
      return res.data;
    } catch (error) {
      console.error("Error adding salesman:", error);
      throw error;
    }
  };

  // Get salesman by ID
  export const getSalesmanByIdApi = async (id) => {
    try {
      const res = await axios.get(`${ApiUrl}/api/salesmen/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching salesman:", error);
      throw error;
    }
  };

  // Update salesman
  export const updateSalesmanApi = async (id, salesmanData) => {
    try {
      const res = await axios.put(`${ApiUrl}/api/salesmen/${id}`, salesmanData);
      return res.data;
    } catch (error) {
      console.error("Error updating salesman:", error);
      throw error;
    }
  };

  // Delete salesman
  export const deleteSalesmanApi = async (id) => {
    try {
      const res = await axios.delete(`${ApiUrl}/api/salesmen/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error deleting salesman:", error);
      throw error;
    }
  };


export const getCustomersBySalesmanApi = async (salesmanId) => {
  try {
    const res = await axios.get(`${ApiUrl}/api/salesmen/${salesmanId}/customers`);
    console.log(res.data)
    return res.data;
  } catch (error) {
    console.error("Error fetching customers by salesman:", {
      salesmanId,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

export const getDistributorsBySalesmanApi = async (salesmanId) => {
  try {
    const res = await axios.get(`${ApiUrl}/api/salesmen/${salesmanId}/distributors`);
    return res.data;
  } catch (error) {
    console.error("Error fetching distributors by salesman:", error);
    throw error;
  }
};


export const saveCustomerAssignmentsApi = async (salesmanId, customerIds) => {
  try {
    const res = await axios.put(
      `${ApiUrl}/api/salesmen/${salesmanId}/customers`,
      { assignedCustomers: customerIds }, 
      { headers: { "Content-Type": "application/json" } }
    );
    return res.data;
  } catch (error) {
    console.error("Error saving customer assignments:", error);
    throw error;
  }
};


export const saveDistributorAssignmentsApi = async (salesmanId, distributorIds) => {
  try {
    const res = await axios.put(
      `${ApiUrl}/api/salesmen/${salesmanId}/distributors`,
      { assignedDistributors: distributorIds }, 
      { headers: { "Content-Type": "application/json" } }
    );
    return res.data;
  } catch (error) {
    console.error("Error saving distributor assignments:", error);
    throw error;
  }
};


// Get unassigned customers (not assigned to any salesman)
export const getUnassignedCustomersApi = async () => {
  try {
    const res = await axios.get(`${ApiUrl}/api/salesmen/customers/unassigned`);
    return res.data;
  } catch (error) {
    console.error("Error fetching unassigned customers:", error);
    throw error;
  }
};

// Get unassigned distributors (not assigned to any salesman)
export const getUnassignedDistributorsApi = async () => {
  try {
    const res = await axios.get(`${ApiUrl}/api/salesmen/distributors/unassigned`);
    return res.data;
  } catch (error) {
    console.error("Error fetching unassigned distributors:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

// ------------------Settings API call--------------------
// Get Settings
export const getSettingsApi = async () => {
  return axios.get(`${ApiUrl}/api/settings`);
};

// Save Settings
export const saveSettingsApi = async (data) => {
  return axios.post(`${ApiUrl}/api/settings`, data);
};