import { useEffect, useState } from "react";
import api from "../api/api";

function Catalogue() {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        api.get("products/")
            .then((response) => {
                setProducts(response.data);
            })
            .catch(() => {
                setError("Could not load products.");
            })
            .finally(() => {
                setLoading(false);
            });

    }, []);

    const addToCart = async (productId) => {

        try {

            await api.post("cart/", {
                product_id: productId,
                quantity: 1,
            });

            alert("Added to cart!");

        } catch (error) {

            console.log(error);

            alert("Could not add product.");

        }

    };

    if (loading) return <h1>Loading...</h1>;

    if (error) return <h1>{error}</h1>;

    return (

        <div>

            <h1>Catalogue</h1>

            {products.map((product) => (

                <div
                    key={product.id}
                    style={{
                        border: "1px solid grey",
                        margin: "20px",
                        padding: "20px"
                    }}
                >

                    <h2>{product.name}</h2>

                    <p>{product.description}</p>

                    <h3>£{product.price}</h3>

                    <button
                        onClick={() => addToCart(product.id)}
                    >
                        Add to Cart
                    </button>

                </div>

            ))}

        </div>

    );

}

export default Catalogue;