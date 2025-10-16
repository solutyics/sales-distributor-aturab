const express = require("express");
const router = express.Router();
const customerController = require("../Controllers/CustomerController");


router.get("/", customerController.getAllCustomers);
router.post("/", customerController.addCustomer);
router.put("/:id", customerController.updateCustomer);
router.delete("/:id", customerController.deleteCustomer);

module.exports = router;
