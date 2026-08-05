import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

function Cart() {

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchCart = () => {
        api.get("cart/")
            .then((response) => setItems(response.data))
            .catch(() => setError("Could not load cart."))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const updateQuantity = async (itemId, quantity) => {
        if (quantity < 1) return;

        try {
            await api.patch(`cart/items/${itemId}/`, { quantity });
            fetchCart();
        } catch (err) {
            alert(err.response?.data?.detail || "Could not update quantity.");
        }
    };

    const removeItem = async (itemId) => {
        try {
            await api.delete(`cart/items/${itemId}/`);
            fetchCart();
        } catch {
            alert("Could not remove item.");
        }
    };

    const subtotal = items.reduce(
        (sum, item) => sum + Number(item.product.price) * item.quantity,
        0
    );

    if (loading) return <p className="max-w-3xl mx-auto px-8 py-10 text-sm text-ink/50">Loading cart…</p>;
    if (error) return <p className="max-w-3xl mx-auto px-8 py-10 text-sm text-red-700">{error}</p>;

    return (

        <div className="max-w-3xl mx-auto px-8 py-10">

            <h1 className="font-display text-2xl font-semibold mb-8">Cart</h1>

            {items.length === 0 && (
                <div className="text-sm text-ink/50">
                    Your cart is empty.{" "}
                    <Link to="/catalogue" className="text-moss font-medium hover:underline">
                        Browse the catalogue
                    </Link>
                </div>
            )}

            <div className="flex flex-col gap-4 mb-8">

                {items.map((item) => (

                    <div
                        key={item.id}
                        className="flex items-center justify-between border-b border-line pb-4"
                    >

                        <div>
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-ink/50 font-mono">£{item.product.price}</p>
                        </div>

                        <div className="flex items-center gap-4">

                            <div className="flex items-center border border-line rounded-sm">
                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="w-8 h-8 text-ink/60 hover:text-moss"
                                >
                                    −
                                </button>
                                <span className="w-8 text-center text-sm">{item.quantity}</span>
                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="w-8 h-8 text-ink/60 hover:text-moss"
                                >
                                    +
                                </button>
                            </div>

                            <button
                                onClick={() => removeItem(item.id)}
                                className="text-sm text-ink/40 hover:text-red-700 transition-colors"
                            >
                                Remove
                            </button>

                        </div>

                    </div>

                ))}

            </div>

            {items.length > 0 && (
                <div className="flex items-center justify-between pt-4">
                    <span className="font-display text-lg font-semibold">Subtotal</span>
                    <span className="font-mono text-lg">£{subtotal.toFixed(2)}</span>
                </div>
            )}

        </div>

    );

}

export default Cart;