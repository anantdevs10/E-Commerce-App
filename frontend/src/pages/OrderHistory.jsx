import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

const STATUS_STYLES = {
    placed: "bg-sand text-ink/70",
    processing: "bg-moss/20 text-moss",
    shipped: "bg-moss/40 text-moss",
    delivered: "bg-moss text-paper",
};

function OrderHistory() {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("orders/")
            .then((res) => setOrders(res.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p className="max-w-3xl mx-auto px-8 py-10 text-sm text-ink/50">Loading orders…</p>;

    return (

        <div className="max-w-3xl mx-auto px-8 py-10">

            <h1 className="font-display text-2xl font-semibold mb-8">Your orders</h1>

            {orders.length === 0 && (
                <p className="text-sm text-ink/50">You haven't placed any orders yet.</p>
            )}

            <div className="flex flex-col gap-3">

                {orders.map((order) => (

                    <Link
                        key={order.id}
                        to={`/orders/${order.id}`}
                        className="flex items-center justify-between border border-line rounded-sm p-5 hover:border-moss transition-colors"
                    >

                        <div>
                            <p className="font-medium">Order #{order.id}</p>
                            <p className="text-sm text-ink/50">
                                {new Date(order.created_at).toLocaleDateString()} · {order.items.length} item(s)
                            </p>
                        </div>

                        <span className={`text-xs font-medium px-3 py-1 rounded-sm capitalize ${STATUS_STYLES[order.status]}`}>
                            {order.status}
                        </span>

                    </Link>

                ))}

            </div>

        </div>

    );

}

export default OrderHistory;