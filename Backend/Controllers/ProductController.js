const db = require("../Config/db");
const { v4: uuidv4 } = require("uuid");

// Get all products
const getAllProducts = (req, res) => {
  const query = "SELECT * FROM products ORDER BY created_at ASC";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching products:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(200).json(results);
  });
};

// Get single product by ID
const getProductById = (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM products WHERE Product_ID = ?";
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error fetching product:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(results[0]);
  });
};

// Add new product
const addProduct = (req, res) => {
  const {
    Distributor_ID,
    Product_name,
    Product_sku,
    Product_category = "Widgets",
    Product_price,
    Product_stock = 0,
    Product_status = "Active",
    Product_description,
  } = req.body;

  if (!Product_name || !Product_sku || Product_price === undefined) {
    return res.status(400).json({ error: "Product_name, Product_sku and Product_price are required" });
  }

  const Product_ID = uuidv4();

  const query = `
    INSERT INTO products 
    (Product_ID, Distributor_ID, Product_name, Product_sku, Product_category, Product_price, Product_stock, Product_status, Product_description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [Product_ID, Distributor_ID, Product_name, Product_sku, Product_category, Product_price, Product_stock, Product_status, Product_description],
    (err, result) => {
      if (err) {
        console.error("Error adding product:", err);
        return res.status(500).json({ error: "Failed to add product" });
      }

      // Fetch the newly added product
      db.query("SELECT * FROM products WHERE Product_ID = ?", [Product_ID], (err2, rows) => {
        if (err2) {
          console.error("Error fetching new product:", err2);
          return res.status(500).json({ error: "Failed to fetch new product" });
        }
        res.status(201).json({ message: "Product added successfully", product: rows[0] });
      });
    }
  );
};

// Update product
const updateProduct = (req, res) => {
  const { id } = req.params;
  const {
    Distributor_ID,
    Product_name,
    Product_sku,
    Product_category,
    Product_price,
    Product_stock,
    Product_status,
    Product_description,
  } = req.body;

  const query = `
    UPDATE products 
    SET Distributor_ID=?, Product_name=?, Product_sku=?, Product_category=?, Product_price=?, Product_stock=?, Product_status=?, Product_description=?
    WHERE Product_ID=?
  `;

  db.query(
    query,
    [Distributor_ID, Product_name, Product_sku, Product_category, Product_price, Product_stock, Product_status, Product_description, id],
    (err, result) => {
      if (err) {
        console.error("Error updating product:", err);
        return res.status(500).json({ error: "Failed to update product" });
      }

      // Fetch updated product
      db.query("SELECT * FROM products WHERE Product_ID = ?", [id], (err2, rows) => {
        if (err2) {
          console.error("Error fetching updated product:", err2);
          return res.status(500).json({ error: "Failed to fetch updated product" });
        }
        res.status(200).json({ message: "Product updated successfully", product: rows[0] });
      });
    }
  );
};

// Delete product
const deleteProduct = (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM products WHERE Product_ID = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting product:", err);
      return res.status(500).json({ error: "Failed to delete product" });
    }
    res.status(200).json({ message: "Product deleted successfully", productId: id });
  });
};

// Export all functions
module.exports = {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
};


