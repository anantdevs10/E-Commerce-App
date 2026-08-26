import { useEffect, useState } from "react";
import api from "../api/api";

const BLANK_FORM = { label: "", line1: "", line2: "", city: "", postcode: "", country: "" };

function AddressBook() {

    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(BLANK_FORM);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);

    const fetchAddresses = () => {
        api.get("addresses/")
            .then((res) => setAddresses(res.data))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleChange = (field) => (e) => {
        setForm({ ...form, [field]: e.target.value });
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await api.post("addresses/", form);
            setForm(BLANK_FORM);
            setShowForm(false);
            fetchAddresses();
        } catch {
            alert("Could not save address. Check all required fields are filled.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`addresses/${id}/`);
            fetchAddresses();
        } catch {
            alert("Could not delete address.");
        }
    };

    if (loading) return <p className="max-w-xl mx-auto px-8 py-10 text-sm text-ink/50">Loading addresses…</p>;

    return (

        <div className="max-w-xl mx-auto px-8 py-10">

            <div className="flex items-center justify-between mb-8">
                <h1 className="font-display text-2xl font-semibold">Address book</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="text-sm text-moss font-medium hover:underline"
                >
                    {showForm ? "Cancel" : "+ Add address"}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleAdd} className="border border-line rounded-sm p-6 mb-8">

                    <input
                        placeholder="Label (e.g. Home)"
                        value={form.label}
                        onChange={handleChange("label")}
                        className="w-full border-0 border-b border-line bg-transparent pb-2 mb-4 outline-none focus:border-moss text-sm"
                    />

                    <input
                        placeholder="Address line 1"
                        value={form.line1}
                        onChange={handleChange("line1")}
                        required
                        className="w-full border-0 border-b border-line bg-transparent pb-2 mb-4 outline-none focus:border-moss text-sm"
                    />

                    <input
                        placeholder="Address line 2 (optional)"
                        value={form.line2}
                        onChange={handleChange("line2")}
                        className="w-full border-0 border-b border-line bg-transparent pb-2 mb-4 outline-none focus:border-moss text-sm"
                    />

                    <input
                        placeholder="City"
                        value={form.city}
                        onChange={handleChange("city")}
                        required
                        className="w-full border-0 border-b border-line bg-transparent pb-2 mb-4 outline-none focus:border-moss text-sm"
                    />

                    <input
                        placeholder="Postcode"
                        value={form.postcode}
                        onChange={handleChange("postcode")}
                        required
                        className="w-full border-0 border-b border-line bg-transparent pb-2 mb-4 outline-none focus:border-moss text-sm"
                    />

                    <input
                        placeholder="Country"
                        value={form.country}
                        onChange={handleChange("country")}
                        required
                        className="w-full border-0 border-b border-line bg-transparent pb-2 mb-6 outline-none focus:border-moss text-sm"
                    />

                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-moss text-paper text-sm font-medium px-6 py-2 rounded-sm hover:bg-moss-light transition-colors disabled:opacity-50"
                    >
                        {saving ? "Saving…" : "Save address"}
                    </button>

                </form>
            )}

            {addresses.length === 0 && !showForm && (
                <p className="text-sm text-ink/50">No saved addresses yet.</p>
            )}

            <div className="flex flex-col gap-4">

                {addresses.map((address) => (

                    <div key={address.id} className="flex items-start justify-between border border-line rounded-sm p-5">

                        <div>
                            {address.label && (
                                <p className="text-xs font-medium text-moss mb-1">{address.label}</p>
                            )}
                            <p className="text-sm">{address.line1}</p>
                            {address.line2 && <p className="text-sm">{address.line2}</p>}
                            <p className="text-sm">{address.city}, {address.postcode}</p>
                            <p className="text-sm text-ink/50">{address.country}</p>
                        </div>

                        <button
                            onClick={() => handleDelete(address.id)}
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

export default AddressBook;