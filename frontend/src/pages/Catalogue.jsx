import { useEffect, useState } from "react";
import {Link} from "react-router-dom"
import api from "../api/api";

function Catalogue() {

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    const [category, setCategory] = useState("");
    const [brand, setBrand] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        api.get("categories/").then((res) => setCategories(res.data));
        api.get("brands/").then((res) => setBrands(res.data));
    }, []);

    const fetchProducts = () => {
        setLoading(true);

        const params = {};
        if (category) params.category = category;
        if (brand) params.brand = brand;
        if (minPrice) params.min_price = minPrice;
        if (maxPrice) params.max_price = maxPrice;

        api.get("products/", { params })
            .then((response) => setProducts(response.data))
            .catch(() => setError("Could not load products."))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchProducts();
    }, [category, brand]);

    const addToCart = async (productId) => {
        try {
            await api.post("cart/", { product_id: productId, quantity: 1 });
            alert("Added to cart.");
        } catch (err) {
            alert(err.response?.data?.detail || "Could not add product.");
        }
    };

    return (

        <div className="max-w-6xl mx-auto px-8 py-10">

            <h1 className="font-display text-2xl font-semibold mb-8">Catalogue</h1>

            <div className="flex flex-wrap items-end gap-6 mb-10 pb-6 border-b border-line">

                <div>
                    <label className="block text-xs font-medium text-ink/50 mb-1">Category</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="border-0 border-b border-line bg-transparent pb-1 pr-6 text-sm outline-none focus:border-moss"
                    >
                        <option value="">All</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-ink/50 mb-1">Brand</label>
                    <select
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        className="border-0 border-b border-line bg-transparent pb-1 pr-6 text-sm outline-none focus:border-moss"
                    >
                        <option value="">All</option>
                        {brands.map((b) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-ink/50 mb-1">Min price</label>
                    <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-20 border-0 border-b border-line bg-transparent pb-1 text-sm outline-none focus:border-moss"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-ink/50 mb-1">Max price</label>
                    <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-20 border-0 border-b border-line bg-transparent pb-1 text-sm outline-none focus:border-moss"
                    />
                </div>

                <button
                    onClick={fetchProducts}
                    className="bg-moss text-paper text-sm font-medium px-4 py-2 rounded-sm hover:bg-moss-light transition-colors"
                >
                    Apply
                </button>

            </div>

            {loading && <p className="text-sm text-ink/50">Loading products…</p>}
            {error && <p className="text-sm text-red-700">{error}</p>}

            {!loading && !error && products.length === 0 && (
                <p className="text-sm text-ink/50">No products match these filters.</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                {products.map((product) => (

                    <div key={product.id} className="border border-line rounded-sm p-6 flex flex-col">

                        <Link to={`/product/${product.id}`}>
                            <h2 className="font-display font-semibold text-base mb-1 hover:text-moss transition-colors">
                                {product.name}
                            </h2>
                        </Link>

                        <p className="text-sm text-ink/60 mb-4 flex-1">{product.description}</p>

                        <div className="flex items-center justify-between mb-4">
                            {product.active_discount_percentage ? (
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-sm line-through text-ink/40">
                                        £{Number(product.price).toFixed(2)}
                                    </span>
                                    <span className="font-mono text-sm text-moss font-semibold">
                                        £{Number(product.effective_price).toFixed(2)}
                                    </span>
                                    <span className="text-xs bg-moss text-paper px-2 py-0.5 rounded-sm">
                                        {product.active_discount_percentage}% off
                                    </span>
                                </div>
                            ) : (
                                <span className="font-mono text-sm">£{Number(product.price).toFixed(2)}</span>
                            )}
                            <span className={`text-xs ${product.stock > 0 ? "text-moss" : "text-red-700"}`}>
                                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                            </span>
                        </div>

                        <button
                            onClick={() => addToCart(product.id)}
                            disabled={product.stock === 0}
                            className="bg-moss text-paper text-sm font-medium py-2 rounded-sm hover:bg-moss-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Add to cart
                        </button>

                    </div>

                ))}

            </div>

        </div>

    );

}

export default Catalogue;