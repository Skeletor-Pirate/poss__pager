const db = require('../db');

// CREATE
function addProduct(name, price, stock, category) {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO products (name, price, stock, category)
      VALUES (?, ?, ?, ?)
    `;
    db.query(query, [name, price, stock, category], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

// READ
function getAllProducts() {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM products';
    db.query(query, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

// UPDATE FULL PRODUCT
function updateProduct(id, name, price, stock, category) {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE products 
      SET name = ?, price = ?, stock = ?, category = ?
      WHERE id = ?
    `;
    db.query(query, [name, price, stock, category, id], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

// DELETE
function deleteProduct(id) {
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM products WHERE id = ?';
    db.query(query, [id], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

module.exports = {
  addProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
};
