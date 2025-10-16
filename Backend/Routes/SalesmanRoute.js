const express = require("express");
const {
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
} = require("../Controllers/SalesmanController");

const router = express.Router();



// ─── Salesman CRUD ─────────────
router.get("/", getAllSalesmen);
router.get("/:id", getSalesmanById);
router.post("/", addSalesman);
router.put("/:id", updateSalesman);
router.delete("/:id", deleteSalesman);

// ─── Assignments ─────────────
router.get("/:id/customers", getCustomersBySalesman);
router.get("/:id/distributors", getDistributorsBySalesman);
router.put("/:id/customers", saveCustomerAssignments);
router.put("/:id/distributors", saveDistributorAssignments);

// Unassigned entities
router.get("/customers/unassigned", getUnassignedCustomers); 
router.get("/distributors/unassigned", getUnassignedDistributors);


module.exports = router;