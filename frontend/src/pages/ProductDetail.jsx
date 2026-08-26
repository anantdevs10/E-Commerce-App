import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";

// bringin in react tools. Use State allows the component to remeber data and useEffect lets the component run code when it first loads
// useParamas is a tool which allows us to grab ID of the product from the URL
// import api allows Axios send HTTP requests to the backend server

function ProductDetail() {

    const { id } = useParams(); // product ID of the certain prodcut

    const [product, setProduct] = useState(null); //creates a store varaibled called product data and setProduct is the function called to update it
    const [offer, setOffer] = useState(null);// creates an offer variable to hold the offer data and setOffer is the function used to update it
    const [recommendations, setRecommendations] = useState([]);// creates a recommendation variable to hold the recommendation data and setRecommendations is the function used to update it
    const [loading, setLoading] = useState(true);// read the above lad

    useEffect(() => {
        api.get(`products/${id}/`)
            .then((res) => setProduct(res.data)) // fetches the product data
            .finally(() => setLoading(false));

        // check if the prodcut has any activeoffers
        api.get("offers/")
            .then((res) => {
                const match = res.data.find((o) => o.product.id === Number(id));
                if (match) setOffer(match); // offer variable changes if there is an offer
            });
    }, [id]);

    useEffect(() => {
        if (product && product.stock === 0) { // Checks if the product data has loaded and if the stock is equal to 0
            api.get("recommendations/", { params: { product: id } }) // If it's out of stock, asks the server for alternative product recommendations and saves them to the recommendations state.
                .then((res) => setRecommendations(res.data));
        }
    }, [product, id]);

    ///addToCart: Sends a POST request to the server to add 1 quantity of this product to the user's shopping cart. 
    // If successful, shows a popup message saying "Added to cart." If it fails, shows an error message.
    ///addToWishlist: Sends a request to save this product to the user's wishlist and shows a confirmation popup.
    ///

    const addToCart = async () => {
        try {
            await api.post("cart/", { product_id: id, quantity: 1 });
            alert("Added to cart.");
        } catch (err) {
            alert(err.response?.data?.detail || "Could not add product.");
        }
    };

    const addToWishlist = async () => {
        try {
            await api.post("wishlist/", { product_id: id });
            alert("Added to wishlist.");
        } catch {
            alert("Could not add to wishlist.");
        }
    };

    if (loading) return <p className="max-w-3xl mx-auto px-8 py-10 text-sm text-ink/50">Loading…</p>;
    if (!product) return <p className="max-w-3xl mx-auto px-8 py-10 text-sm text-red-700">Product not found.</p>;

    return (

        <div className="max-w-3xl mx-auto px-8 py-10">

            <h1 className="font-display text-2xl font-semibold mb-2">{product.name}</h1>
            <p className="text-sm text-ink/60 mb-6">{product.description}</p>

            <div className="flex items-center gap-3 mb-6">
                {offer ? (
                    <>
                        <span className="font-mono text-lg line-through text-ink/40">£{product.price}</span>
                        <span className="font-mono text-lg text-moss font-semibold">£{offer.discounted_price}</span>
                        <span className="text-xs bg-moss text-paper px-2 py-1 rounded-sm">
                            {offer.discount_percentage}% off
                        </span>
                    </>
                ) : (
                    <span className="font-mono text-lg">£{product.price}</span>
                )}
            </div>

            <p className={`text-sm mb-6 ${product.stock > 0 ? "text-moss" : "text-red-700"}`}>
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </p>

            <div className="flex gap-3 mb-10">
                <button
                    onClick={addToCart}
                    disabled={product.stock === 0}
                    className="bg-moss text-paper text-sm font-medium px-6 py-2.5 rounded-sm hover:bg-moss-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Add to cart
                </button>
                <button
                    onClick={addToWishlist}
                    className="border border-moss text-moss text-sm font-medium px-6 py-2.5 rounded-sm hover:bg-moss hover:text-paper transition-colors"
                >
                    Add to wishlist
                </button>
            </div>

            {product.stock === 0 && recommendations.length > 0 && (
                <div>
                    <h2 className="font-display text-lg font-semibold mb-4">You might also like</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {recommendations.map((rec) => (
                            <a
                                key={rec.id}
                                href={`/product/${rec.id}`}
                                className="border border-line rounded-sm p-4 hover:border-moss transition-colors"
                            >
                                <p className="font-medium text-sm">{rec.name}</p>
                                <p className="font-mono text-sm text-ink/60">£{rec.price}</p>
                            </a>
                        ))}
                    </div>
                </div>
            )}

        </div>

    );

}

export default ProductDetail;