const express = require("express");
const router = express.Router();
const { getSettings, saveSettings } = require("../Controllers/SettingController");


router.get("/", getSettings);
router.post("/", saveSettings);

module.exports = router;
