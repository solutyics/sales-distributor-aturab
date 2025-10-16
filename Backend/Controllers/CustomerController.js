const db = require("../Config/db");
const { v4: uuidv4 } = require("uuid");

// ─── Get All Customers ─────────────
exports.getAllCustomers = (req, res) => {
  const query = "SELECT * FROM customers ORDER BY Customer_name ASC";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching customers:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    // Parse customer_salesmen JSON safely
    const customers = results.map((c) => ({
      ...c,
      customer_salesmen: (() => {
        try {
          return typeof c.customer_salesmen === "string"
            ? JSON.parse(c.customer_salesmen)
            : c.customer_salesmen || [];
        } catch {
          console.warn("Invalid JSON in customer_salesmen:", c.customer_salesmen);
          return [];
        }
      })(),
    }));

    res.json(customers);
  });
};

// ─── Add New Customer ─────────────
exports.addCustomer = (req, res) => {
  const {
    Salesman_ID,
    Customer_name,
    Customer_city,
    Customer_region,
    Customer_tier,
    customer_salesmen,
    Customer_contact,
    Customer_email,
    Customer_phone,
    Customer_address,
    Customer_notes,
    Customer_status,
  } = req.body;

  // Basic validation
  if (!Customer_name || !Customer_city || !Customer_region) {
    return res.status(400).json({ message: "Name, City, and Region are required" });
  }

  const Customer_ID = uuidv4(); // 

  const query = `
    INSERT INTO customers 
    (Customer_ID, Salesman_ID, Customer_name, Customer_city, Customer_region, Customer_tier, customer_salesmen, Customer_contact, Customer_email, Customer_phone, Customer_address, Customer_notes, Customer_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    Customer_ID,
    Salesman_ID || null,
    Customer_name,
    Customer_city,
    Customer_region,
    Customer_tier || "A",
    JSON.stringify(customer_salesmen || []),
    Customer_contact || "",
    Customer_email || "",
    Customer_phone || "",
    Customer_address || "",
    Customer_notes || "",
    Customer_status || "Active",
  ];

  db.query(query, values, (err) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ message: "Email already exists!" });
      }
      console.error("Error adding customer:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    res.json({ message: "Customer added successfully!" });
  });
};

// ─── Update Customer ─────────────
exports.updateCustomer = (req, res) => {
  const { id } = req.params;
  const {
    Salesman_ID,
    Customer_name,
    Customer_city,
    Customer_region,
    Customer_tier,
    customer_salesmen,
    Customer_contact,
    Customer_email,
    Customer_phone,
    Customer_address,
    Customer_notes,
    Customer_status,
  } = req.body;

  const query = `
    UPDATE customers SET
    Salesman_ID = ?,
    Customer_name = ?,
    Customer_city = ?,
    Customer_region = ?,
    Customer_tier = ?,
    customer_salesmen = ?,
    Customer_contact = ?,
    Customer_email = ?,
    Customer_phone = ?,
    Customer_address = ?,
    Customer_notes = ?,
    Customer_status = ?
    WHERE Customer_ID = ?
  `;

  const values = [
    Salesman_ID || null,
    Customer_name,
    Customer_city,
    Customer_region,
    Customer_tier || "A",
    JSON.stringify(customer_salesmen || []),
    Customer_contact || "",
    Customer_email || "",
    Customer_phone || "",
    Customer_address || "",
    Customer_notes || "",
    Customer_status || "Active",
    id,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ message: "Email already exists!" });
      }
      console.error("Error updating customer:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({ message: "Customer updated successfully!" });
  });
};

// ─── Delete Customer ─────────────
exports.deleteCustomer = (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM customers WHERE Customer_ID = ?";

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting customer:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({ message: "Customer deleted successfully!" });
  });
};



