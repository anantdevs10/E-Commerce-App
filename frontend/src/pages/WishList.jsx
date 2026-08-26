import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/api";

function Wishlist() {

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchWishlist = () => {
        api.get("wishlist/")
            .then((res) => setItems(res.data))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const removeItem = async (id) => {
        try {
            await api.delete(`wishlist/${id}/`);
            fetchWishlist();
        } catch {
            alert("Could not remove item.");
        }
    };

    if (loading) return <p className="max-w-3xl mx-auto px-8 py-10 text-sm text-ink/50">Loading wishlist…</p>;

    return (

        <div className="max-w-3xl mx-auto px-8 py-10">

            <h1 className="font-display text-2xl font-semibold mb-8">Wishlist</h1>

            {items.length === 0 && <p className="text-sm text-ink/50">Nothing saved yet.</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {items.map((item) => (

                    <div key={item.id} className="border border-line rounded-sm p-5">

                        <Link to={`/product/${item.product.id}`} className="font-medium text-sm hover:text-moss">
                            {item.product.name}
                        </Link>

                        <p className="font-mono text-sm text-ink/60 mb-3">£{item.product.price}</p>

                        <button
                            onClick={() => removeItem(item.id)}
                            className="text-sm text-ink/40 hover:text-red-700 transition-colors"
                        >
                            Remove
                        </button>

                    </div>

                ))}

            </div>

        </div>

    );

}

export default Wishlist;