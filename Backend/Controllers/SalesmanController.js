const db = require("../Config/db");
const { v4: uuidv4 } = require("uuid");

// Valid ENUM values
const validRegions = ["North-East", "Mid-West", "Pacific"];
const validStatus = ["Active", "Inactive"];

// ─── Get All Salesmen ─────────────
const getAllSalesmen = (req, res) => {
  const sql = "SELECT * FROM salesmen ORDER BY created_at ASC";
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ message: "Failed to fetch salesmen", error: err.sqlMessage || err });
    res.status(200).json(rows);
  });
};

// ─── Get Salesman By ID ─────────────
const getSalesmanById = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM salesmen WHERE Salesman_ID = ?";
  db.query(sql, [id], (err, rows) => {
    if (err) return res.status(500).json({ message: "Failed to fetch salesman", error: err.sqlMessage || err });
    if (rows.length === 0) return res.status(404).json({ message: "Salesman not found" });
    res.status(200).json(rows[0]);
  });
};

// ─── Add Salesman ─────────────
const addSalesman = (req, res) => {
  let { Salesman_name, Salesman_region, Salesman_email, Salesman_phone, Salesman_distros, Salesman_custs, Salesman_status } = req.body;

  if (!Salesman_name || !Salesman_region || !Salesman_email || !Salesman_phone) {
    return res.status(400).json({ message: "Please fill all required fields (Name, Region, Email, Phone)" });
  }

  Salesman_region = validRegions.includes(Salesman_region) ? Salesman_region : "Pacific";
  Salesman_status = validStatus.includes(Salesman_status) ? Salesman_status : "Active";

  Salesman_distros = Number(Salesman_distros) || 0;
  Salesman_custs = Number(Salesman_custs) || 0;

  const Salesman_ID = uuidv4();
  const sql = `
    INSERT INTO salesmen 
    (Salesman_ID, Salesman_name, Salesman_region, Salesman_email, Salesman_phone, Salesman_distros, Salesman_custs, Salesman_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [Salesman_ID, Salesman_name, Salesman_region, Salesman_email, Salesman_phone, Salesman_distros, Salesman_custs, Salesman_status], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to add salesman", error: err.sqlMessage || err });
    res.status(201).json({
      message: "Salesman added successfully!",
      salesman: { Salesman_ID, Salesman_name, Salesman_region, Salesman_email, Salesman_phone, Salesman_distros, Salesman_custs, Salesman_status },
    });
  });
};

// ─── Update Salesman ─────────────
const updateSalesman = (req, res) => {
  const { id } = req.params;
  let { Salesman_name, Salesman_region, Salesman_email, Salesman_phone, Salesman_distros, Salesman_custs, Salesman_status } = req.body;

  if (!Salesman_name || !Salesman_region || !Salesman_email || !Salesman_phone) {
    return res.status(400).json({ message: "Please fill all required fields (Name, Region, Email, Phone)" });
  }

  Salesman_region = validRegions.includes(Salesman_region) ? Salesman_region : "Pacific";
  Salesman_status = validStatus.includes(Salesman_status) ? Salesman_status : "Active";

  Salesman_distros = Number(Salesman_distros) || 0;
  Salesman_custs = Number(Salesman_custs) || 0;

  const sql = `
    UPDATE salesmen SET
      Salesman_name = ?, 
      Salesman_region = ?, 
      Salesman_email = ?, 
      Salesman_phone = ?, 
      Salesman_distros = ?, 
      Salesman_custs = ?, 
      Salesman_status = ?
    WHERE Salesman_ID = ?
  `;

  db.query(sql, [Salesman_name, Salesman_region, Salesman_email, Salesman_phone, Salesman_distros, Salesman_custs, Salesman_status, id], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to update salesman", error: err.sqlMessage || err });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Salesman not found" });
    res.status(200).json({ message: "Salesman updated successfully!" });
  });
};

// ─── Delete Salesman ─────────────
const deleteSalesman = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM salesmen WHERE Salesman_ID = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to delete salesman", error: err.sqlMessage || err });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Salesman not found" });
    res.status(200).json({ message: "Salesman deleted successfully!" });
  });
};

// ─── Get Customers Assigned to a Salesman ─────────────
const getCustomersBySalesman = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM customers WHERE salesman_id = ?";
  db.query(sql, [id], (err, rows) => {
    if (err) return res.status(500).json({ message: "Failed to fetch customers", error: err.sqlMessage || err });
    res.status(200).json({ count: rows.length, customers: rows });
  });
};

// ─── Get Distributors Assigned to a Salesman ─────────────
const getDistributorsBySalesman = (req, res) => {
  const { id } = req.params;
  console.log("Fetching distributors for salesman:", id); 

  const sql = "SELECT * FROM distributors WHERE Salesman_ID = ?";
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error fetching distributors:", err);
      return res.status(500).json({ message: "Error fetching distributors" });
    }

    console.log("Found distributors:", results);
    res.status(200).json({ distributors: results });
  });
};


// Ensure counts are updated in DB
const saveCustomerAssignments = (req, res) => {
  const { id } = req.params;
  let { assignedCustomers } = req.body;

  console.log("Saving customers for salesman:", id, "IDs:", assignedCustomers);

  if (!Array.isArray(assignedCustomers)) {
    return res.status(400).json({ message: "Invalid data format, expected array of Customer_IDs" });
  }

  const clearQuery = "UPDATE customers SET Salesman_ID = NULL WHERE Salesman_ID = ?";
  db.query(clearQuery, [id], (clearErr) => {
    if (clearErr) {
      console.error("Clear error:", clearErr);
      return res.status(500).json({ message: "Failed to clear previous customer assignments", error: clearErr.sqlMessage });
    }

    if (assignedCustomers.length === 0) {
      const updateSalesmanCount = "UPDATE salesmen SET Salesman_custs = 0 WHERE Salesman_ID = ?";
      db.query(updateSalesmanCount, [id], (countErr) => {
        if (countErr) console.error("Failed to update customer count:", countErr);
      });
      return res.status(200).json({ message: "Customer assignments cleared successfully!" });
    }

    const updateQuery = "UPDATE customers SET Salesman_ID = ? WHERE Customer_ID = ?";
    const tasks = assignedCustomers.map((custId) =>
      new Promise((resolve, reject) => {
        db.query(updateQuery, [id, custId], (err) => (err ? reject(err) : resolve()));
      })
    );

    Promise.all(tasks)
      .then(() => {
        const countQuery = "UPDATE salesmen SET Salesman_custs = ? WHERE Salesman_ID = ?";
        db.query(countQuery, [assignedCustomers.length, id], (countErr) => {
          if (countErr) console.error("Failed to update customer count:", countErr);
        });
        res.status(200).json({ message: "Customer assignments saved successfully!", count: assignedCustomers.length });
      })
      .catch((err) => {
        console.error("Promise all error:", err);
        res.status(500).json({ message: "Failed to assign customers", error: err.sqlMessage });
      });
  });
};

// Ensure counts are updated in DB
const saveDistributorAssignments = (req, res) => {
  const { id } = req.params;
  let { assignedDistributors } = req.body;

  console.log("Saving distributors for salesman:", id, "IDs:", assignedDistributors);

  if (!Array.isArray(assignedDistributors)) {
    return res.status(400).json({ message: "Invalid data format, expected array of Distributor_IDs" });
  }

  const clearQuery = "UPDATE distributors SET Salesman_ID = NULL WHERE Salesman_ID = ?";
  db.query(clearQuery, [id], (clearErr) => {
    if (clearErr) {
      console.error("Clear error:", clearErr);
      return res.status(500).json({ message: "Failed to clear previous distributor assignments", error: clearErr.sqlMessage });
    }

    if (assignedDistributors.length === 0) {
      const updateSalesmanCount = "UPDATE salesmen SET Salesman_distros = 0 WHERE Salesman_ID = ?";
      db.query(updateSalesmanCount, [id], (countErr) => {
        if (countErr) console.error("Failed to update distributor count:", countErr);
      });
      return res.status(200).json({ message: "Distributor assignments cleared successfully!" });
    }

    const updateQuery = "UPDATE distributors SET Salesman_ID = ? WHERE Distributor_ID = ?";
    const tasks = assignedDistributors.map((distId) =>
      new Promise((resolve, reject) => {
        db.query(updateQuery, [id, distId], (err) => (err ? reject(err) : resolve()));
      })
    );

    Promise.all(tasks)
      .then(() => {
        const countQuery = "UPDATE salesmen SET Salesman_distros = ? WHERE Salesman_ID = ?";
        db.query(countQuery, [assignedDistributors.length, id], (countErr) => {
          if (countErr) console.error("Failed to update distributor count:", countErr);
        });
        res.status(200).json({ message: "Distributor assignments saved successfully!", count: assignedDistributors.length });
      })
      .catch((err) => {
        console.error("Promise all error:", err);
        res.status(500).json({ message: "Failed to assign distributors", error: err.sqlMessage });
      });
  });
};


// Get Unassigned Customers
const getUnassignedCustomers = (req, res) => {
  const sql = "SELECT * FROM customers WHERE Salesman_ID IS NULL";
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ message: "Failed to fetch unassigned customers", error: err.sqlMessage || err });
    res.status(200).json({ count: rows.length, customers: rows });
  });
};

// Get Unassigned Distributors
const getUnassignedDistributors = (req, res) => {
  const sql = "SELECT * FROM distributors WHERE Salesman_ID IS NULL";
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ message: "Failed to fetch unassigned distributors", error: err.sqlMessage || err });
    res.status(200).json({ count: rows.length, distributors: rows });
  });
};



module.exports = {
  getAllSalesmen,
  getSalesmanById,
  addSalesman,
  updateSalesman,
  deleteSalesman,
  getCustomersBySalesman,
  getDistributorsBySalesman,
  saveCustomerAssignments,
  saveDistributorAssignments,
  getUnassignedCustomers, 
  getUnassignedDistributors, 
};