// frontend/src/pages/OrderDetail.jsx — new file
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

const STEPS = ["placed", "processing", "shipped", "delivered"];

function OrderDetail() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reordering, setReordering] = useState(false);

    useEffect(() => {
        api.get(`orders/${id}/`)
            .then((res) => setOrder(res.data))
            .finally(() => setLoading(false));
    }, [id]);

    const handleReorder = async () => {
        setReordering(true);
        try {
            const res = await api.post(`orders/${id}/reorder/`);
            const skipped = res.data.skipped_out_of_stock;
            if (skipped.length > 0) {
                alert(`Added to cart. Out of stock and skipped: ${skipped.join(", ")}`);
            } else {
                alert("Items added to cart.");
            }
            navigate("/cart");
        } catch {
            alert("Could not reorder.");
        } finally {
            setReordering(false);
        }
    };

    if (loading) return <p className="max-w-3xl mx-auto px-8 py-10 text-sm text-ink/50">Loading order…</p>;
    if (!order) return <p className="max-w-3xl mx-auto px-8 py-10 text-sm text-red-700">Order not found.</p>;

    const currentStepIndex = STEPS.indexOf(order.status);
    const total = order.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

    return (

        <div className="max-w-3xl mx-auto px-8 py-10">

            <h1 className="font-display text-2xl font-semibold mb-1">Order #{order.id}</h1>
            <p className="text-sm text-ink/50 mb-10">
                Placed on {new Date(order.created_at).toLocaleDateString()}
            </p>

            <div className="flex items-center justify-between mb-12">
                {STEPS.map((step, index) => (
                    <div key={step} className="flex-1 flex flex-col items-center relative">
                        <div
                            className={`w-3 h-3 rounded-full mb-2 ${
                                index <= currentStepIndex ? "bg-moss" : "bg-line"
                            }`}
                        />
                        <span className={`text-xs capitalize ${
                            index <= currentStepIndex ? "text-ink font-medium" : "text-ink/40"
                        }`}>
                            {step}
                        </span>
                        {index < STEPS.length - 1 && (
                            <div
                                className={`absolute top-1.5 left-1/2 w-full h-px ${
                                    index < currentStepIndex ? "bg-moss" : "bg-line"
                                }`}
                            />
                        )}
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-4 mb-8">

                {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b border-line pb-4">
                        <div>
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-sm text-ink/50">Qty {item.quantity}</p>
                        </div>
                        <span className="font-mono text-sm">£{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                ))}

            </div>

            <div className="flex items-center justify-between mb-10">
                <span className="font-display text-lg font-semibold">Total</span>
                <span className="font-mono text-lg">£{total.toFixed(2)}</span>
            </div>

            <button
                onClick={handleReorder}
                disabled={reordering}
                className="w-full border border-moss text-moss font-medium py-3 rounded-sm hover:bg-moss hover:text-paper transition-colors disabled:opacity-50"
            >
                {reordering ? "Adding to cart…" : "Reorder these items"}
            </button>

        </div>

    );

}

export default OrderDetail;