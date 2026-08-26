import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

function Cart() {

    const navigate = useNavigate();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [checkingOut, setCheckingOut] = useState(false);

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

    // This is the new piece. It calls checkout, then uses the order id
    // the backend returns to navigate straight to that order's tracking page.
    const handleCheckout = async () => {
        setCheckingOut(true);
        try {
            const response = await api.post("orders/");
            navigate(`/orders/${response.data.id}`);
        } catch (err) {
            alert(err.response?.data?.detail || "Checkout failed.");
        } finally {
            setCheckingOut(false);
        }
    };

    const subtotal = items.reduce(
        (sum, item) => sum + Number(item.product.effective_price) * item.quantity,
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
                            <p className="text-sm text-ink/50 font-mono">
                                £{Number(item.product.effective_price).toFixed(2)}
                                {item.product.active_discount_percentage && (
                                    <span className="ml-2 line-through text-ink/30">
                                        £{Number(item.product.price).toFixed(2)}
                                    </span>
                                )}
                            </p>
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
                <div>
                    <div className="flex items-center justify-between pt-4 mb-6">
                        <span className="font-display text-lg font-semibold">Subtotal</span>
                        <span className="font-mono text-lg">£{subtotal.toFixed(2)}</span>
                    </div>

                    <button
                        onClick={handleCheckout}
                        disabled={checkingOut}
                        className="w-full bg-moss text-paper font-medium py-3 rounded-sm hover:bg-moss-light transition-colors disabled:opacity-50"
                    >
                        {checkingOut ? "Placing order…" : "Checkout"}
                    </button>
                </div>
            )}

        </div>

    );

}

export default Cart;