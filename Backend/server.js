const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./Config/db");

const productRoutes = require("./Routes/ProductRoutes");
const distributorRoutes = require("./Routes/DistributorRoute");
const customerRoutes = require("./Routes/CustomerRoute");
const salesmanRoutes = require("./Routes/SalesmanRoute");
const settingsRoutes = require("./Routes/SettingRoutes");


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Server is running successfully..."));

// Product API routes
app.use("/api/products", productRoutes);
app.use("/api/distributors", distributorRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/salesmen", salesmanRoutes);
app.use("/api/settings", settingsRoutes);


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(` Server running on PORT ${PORT}`));
