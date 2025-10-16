// controllers/settingsController.js
const db = require("../Config/db");
const { v4: uuidv4 } = require("uuid");

// Fetch latest settings
const getSettings = (req, res) => {
  const query = "SELECT * FROM settings ORDER BY created_at ASC";

  db.query(query, (err, results) => {
    if (err) {
      console.error("getSettings - DB error:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    // If no settings found, send empty object
    const settings = results.length > 0 ? results[0] : {};
    return res.status(200).json(settings);
  });
};

// Save or update settings
const saveSettings = (req, res) => {
  const { company_name, timezone, currency } = req.body;

  // Basic validation
  if (
    !company_name?.trim() ||
    !timezone?.trim() ||
    !currency?.trim()
  ) {
    return res
      .status(400)
      .json({ message: "company_name, timezone, and currency are required" });
  }

  const company = company_name.trim();
  const tz = timezone.trim();
  const cur = currency.trim();

  // Check if settings already exist
  const checkQuery = "SELECT * FROM settings ORDER BY created_at DESC LIMIT 1";
  db.query(checkQuery, (checkErr, rows) => {
    if (checkErr) {
      console.error("saveSettings - DB check error:", checkErr);
      return res.status(500).json({ message: "Database error", error: checkErr });
    }

    if (rows.length > 0) {
      // Update the latest record
      const existingId = rows[0].setting_id;
      const updateQuery = `
        UPDATE settings
        SET company_name = ?, timezone = ?, currency = ?, updated_at = NOW()
        WHERE setting_id = ?
      `;

      db.query(updateQuery, [company, tz, cur, existingId], (updErr) => {
        if (updErr) {
          console.error("saveSettings - DB update error:", updErr);
          return res.status(500).json({ message: "Database error", error: updErr });
        }

        return res
          .status(200)
          .json({ message: "Settings updated successfully", setting_id: existingId });
      });
    } else {
      // Insert new record
      const newId = uuidv4();
      const insertQuery = `
        INSERT INTO settings (setting_id, company_name, timezone, currency)
        VALUES (?, ?, ?, ?)
      `;

      db.query(insertQuery, [newId, company, tz, cur], (insErr) => {
        if (insErr) {
          console.error("saveSettings - DB insert error:", insErr);
          return res.status(500).json({ message: "Database error", error: insErr });
        }

        return res
          .status(201)
          .json({ message: "Settings saved successfully", setting_id: newId });
      });
    }
  });
};

module.exports = { getSettings, saveSettings };