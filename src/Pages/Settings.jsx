import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import CustomToaster from "../Components/CustomeToaster";
import { getSettingsApi, saveSettingsApi } from "../Api/Api";

const Settings = () => {
  const [form, setForm] = useState({
    company_name: "",
    timezone: "",
    currency: "",
  });

  // Fetch settings from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await getSettingsApi();
        if (res && res.data) {
          setForm({
            company_name: res.data.company_name || "",
            timezone: res.data.timezone || "",
            currency: res.data.currency || "",
          });
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error("⚠️ Failed to load settings!");
      }
    };
    fetchSettings();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Save settings to backend
  const handleSave = async () => {
    try {
      const res = await saveSettingsApi(form);

      if (res.status === 200 || res.status === 201) {
        toast.success("Settings saved successfully!");
      } else {
        toast.error("Failed to save settings!");
      }
    } catch (error) {
      console.error("Save error:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.message || "Error saving settings!"
      );
    }
  };

  // Dummy export button
  const handleExport = () => {
    toast.success("📦 Data exported as CSV!");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-900 text-white rounded-2xl shadow-lg mt-10">
      <CustomToaster />
      <h2 className="text-2xl font-semibold mb-6 text-center">⚙️ SETTINGS</h2>

      {/* --- Form Fields --- */}
      <div className="grid grid-cols-3 gap-4 items-center">
        <label className="col-span-1 text-gray-300">Company:</label>
        <div className="col-span-2">
          <input
            type="text"
            name="company_name"
            value={form.company_name}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500"
            placeholder="Enter company name"
          />
        </div>

        <label className="col-span-1 text-gray-300">Timezone:</label>
        <div className="col-span-2">
          <select
            name="timezone"
            value={form.timezone}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500"
          >
            <option value="">Select timezone</option>
            <option value="Asia/Karachi">Asia/Karachi (PKT)</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York (EST)</option>
            <option value="Europe/London">Europe/London (GMT)</option>
          </select>
        </div>

        <label className="col-span-1 text-gray-300">Currency:</label>
        <div className="col-span-2">
          <select
            name="currency"
            value={form.currency}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500"
          >
            <option value="">Select currency</option>
            <option value="PKR">PKR (₨)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>
      </div>

      {/* --- Buttons --- */}
      <div className="mt-6 flex justify-between items-center">
        <button
          onClick={() => toast("🔐 Roles & Permissions coming soon!")}
          className="bg-yellow-600 hover:bg-yellow-700 px-5 py-2 rounded-lg font-semibold transition"
        >
          ⚙️ Manage Roles ▶
        </button>

        <button
          onClick={handleExport}
          className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg font-semibold transition"
        >
          📤 Export All CSV
        </button>

        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold transition"
        >
          💾 Save
        </button>
      </div>
    </div>
  );
};

export default Settings;