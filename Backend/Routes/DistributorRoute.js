const express = require("express");
const {
  addDistributor,
  getDistributors,
  updateDistributor,
  deleteDistributor,
} = require("../Controllers/DistributorController");

const router = express.Router();

// Routes
router.get("/", getDistributors);          
router.post("/", addDistributor);          
router.put("/:id", updateDistributor);    
router.delete("/:id", deleteDistributor);  

module.exports = router;
