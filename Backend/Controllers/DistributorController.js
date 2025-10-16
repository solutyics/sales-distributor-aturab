const db = require("../Config/db");
const { v4: uuidv4 } = require("uuid");

/* ---------------------------------------------
   Add Distributor
--------------------------------------------- */
const addDistributor = (req, res) => {
  const {
    distributor_name,
    distributor_company,
    distributor_region,
    distributor_phone,
    distributor_email,
    distributor_contact,
    distributor_status,
    distributor_assignedProducts,
    salesman_id,
  } = req.body;

  const distributor_id = uuidv4();

  const sql = `
    INSERT INTO distributors (
      Distributor_ID,
      Salesman_ID,
      Distributor_name,
      Distributor_company,
      Distributor_region,
      Distributor_phone,
      Distributor_email,
      Distributor_contact,
      Distributor_status,
      Distributor_assignedProducts
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      distributor_id,
      salesman_id || null,
      distributor_name,
      distributor_company,
      distributor_region,
      distributor_phone,
      distributor_email,
      distributor_contact,
      distributor_status || "Active",
      distributor_assignedProducts || 0,
    ],
    (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res
            .status(400)
            .json({ message: "Email already exists! Please use a different email." });
        }

        console.error("Error adding distributor:", err);
        return res.status(500).json({ message: "Database Error", error: err });
      }

      const fetchSql = "SELECT * FROM distributors WHERE Distributor_ID = ?";
      db.query(fetchSql, [distributor_id], (err, rows) => {
        if (err) {
          console.error("Error fetching new distributor:", err);
          return res.status(500).json({ message: "Database Error", error: err });
        }

        const row = rows[0];
        const distributor = {
          distributor_id: row.Distributor_ID,
          salesman_id: row.Salesman_ID,
          distributor_name: row.Distributor_name,
          distributor_company: row.Distributor_company,
          distributor_region: row.Distributor_region,
          distributor_phone: row.Distributor_phone,
          distributor_email: row.Distributor_email,
          distributor_contact: row.Distributor_contact,
          distributor_status: row.Distributor_status,
          distributor_assignedProducts: row.Distributor_assignedProducts,
          created_at: row.Distributor_created_at,
        };

        res.status(201).json({
          message: "Distributor added successfully",
          distributor,
        });
      });
    }
  );
};

/* ---------------------------------------------
   Get All Distributors
--------------------------------------------- */
const getDistributors = (req, res) => {
  const sql = "SELECT * FROM distributors ORDER BY Distributor_created_at ASC";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching distributors:", err);
      return res.status(500).json({ message: "Database Error", error: err });
    }

    const distributors = result.map((row) => ({
      distributor_id: row.Distributor_ID,
      salesman_id: row.Salesman_ID,
      distributor_name: row.Distributor_name,
      distributor_company: row.Distributor_company,
      distributor_region: row.Distributor_region,
      distributor_phone: row.Distributor_phone,
      distributor_email: row.Distributor_email,
      distributor_contact: row.Distributor_contact,
      distributor_status: row.Distributor_status,
      distributor_assignedProducts: row.Distributor_assignedProducts,
      notes: row.notes || "",
      created_at: row.Distributor_created_at,
    }));

    res.status(200).json(distributors);
  });
};

/* ---------------------------------------------
   Update Distributor (with notes + assigned products)
--------------------------------------------- */
const updateDistributor = (req, res) => {
  const { id } = req.params;
  const {
    distributor_name,
    distributor_company,
    distributor_region,
    distributor_phone,
    distributor_email,
    distributor_contact,
    distributor_status,
    distributor_assignedProducts,
    salesman_id,
    assigned_products, 
    notes, 
  } = req.body;

  // Helper to wrap db.query into a promise
  const queryPromise = (sql, params) =>
    new Promise((resolve, reject) => {
      db.query(sql, params, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

  (async () => {
    try {
      // ─── Step 1: Update distributor base info ────────────────
      const updateSql = `
        UPDATE distributors
        SET
          Salesman_ID = ?,
          Distributor_name = ?,
          Distributor_company = ?,
          Distributor_region = ?,
          Distributor_phone = ?,
          Distributor_email = ?,
          Distributor_contact = ?,
          Distributor_status = ?,
          Distributor_assignedProducts = ?,
          notes = ?
        WHERE Distributor_ID = ?
      `;

      await queryPromise(updateSql, [
        salesman_id || null,
        distributor_name,
        distributor_company,
        distributor_region,
        distributor_phone,
        distributor_email,
        distributor_contact,
        distributor_status,
        distributor_assignedProducts || 0,
        notes || null,
        id,
      ]);

      // ─── Step 2: Update assigned products ───────────────────
      if (Array.isArray(assigned_products)) {
        // Unassign all products from this distributor
        await queryPromise(
          `UPDATE products SET Distributor_ID = NULL WHERE Distributor_ID = ?`,
          [id]
        );

        if (assigned_products.length > 0) {
          // Assign the selected products
          await queryPromise(
            `UPDATE products SET Distributor_ID = ? WHERE Product_ID IN (?)`,
            [id, assigned_products]
          );
        }
      }

      res.status(200).json({ message: "Distributor updated successfully!" });
    } catch (error) {
      console.error("Database error during distributor update:", error);
      res.status(500).json({
        message: "Database error while updating distributor.",
        error: error.sqlMessage || error.message,
      });
    }
  })();
};

/* ---------------------------------------------
   Delete Distributor
--------------------------------------------- */
const deleteDistributor = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM distributors WHERE Distributor_ID = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting distributor:", err);
      return res.status(500).json({ message: "Database Error", error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Distributor not found" });
    }

    res.status(200).json({ message: "Distributor deleted successfully" });
  });
};

// Get All Salesmen
const getSalesmen = (req, res) => {
  const sql = "SELECT Salesman_ID, Salesman_name FROM salesmen ORDER BY Salesman_name ASC";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching salesmen:", err);
      return res.status(500).json({ message: "Database Error", error: err });
    }

    res.status(200).json(result);
  });
};

module.exports = {
  addDistributor,
  getDistributors,
  updateDistributor,
  deleteDistributor,
  getSalesmen, // export new function
};


