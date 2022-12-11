connection.connect();

async function getProductTypes() {
  let values = None;
  await connection.query(
    'SHOW COLUMNS FROM produse WHERE Field = "tip_produs"',
    (error, results) => {
      if (error) throw error;

      const type = results[0].Type; // ar trebui sa returneze "enum('telefon', 'tableta', 'laptop', 'smartwatch', 'accesorii')"
      values = type.split("'")[1].split("','"); // ar trebui sa returneze ["telefon", "tableta", "laptop", "smartwatch", "accesorii"]
    }
  );
  return values;
}

async function getProducts() {
  let products = [];
  await connection.query("SELECT * FROM produse", (error, results) => {
    if (error) throw error;
    products = results;
  });
  return products;
}

module.exports = {
    getProductTypes,
    getProducts
}