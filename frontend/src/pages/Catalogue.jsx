import { useEffect, useState } from "react";
import api from "../api/api";

function Catalogue() {
  // State variables
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Runs once when the page loads
  useEffect(() => {
    api
      .get("products/")
      .then((response) => {
        setProducts(response.data);
      })
      .catch((error) => {
        console.error(error);
        setError("Could not load products.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Loading screen
  if (loading) {
    return <h1>Loading...</h1>;
  }

  // Error screen
  if (error) {
    return <h1>{error}</h1>;
  }

  // Display products
  return (
    <div>
      <h1>Product Catalogue</h1>

      {products.map((product) => (
        <div key={product.id}>
          <h2>{product.name}</h2>
          <p>{product.description}</p>
          <p>£{product.price}</p>
          <hr />
        </div>
      ))}
    </div>
  );
}

export default Catalogue;