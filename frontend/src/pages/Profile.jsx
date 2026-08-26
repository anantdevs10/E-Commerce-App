import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

function Profile() {

    const [profile, setProfile] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [bio, setBio] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        api.get("profile/")
            .then((res) => {
                setProfile(res.data);
                setPhoneNumber(res.data.phone_number);
                setBio(res.data.bio);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSaved(false);

        try {
            await api.patch("profile/", { phone_number: phoneNumber, bio });
            setSaved(true);
        } catch {
            alert("Could not save profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p className="max-w-xl mx-auto px-8 py-10 text-sm text-ink/50">Loading profile…</p>;

    return (

        <div className="max-w-xl mx-auto px-8 py-10">

            <h1 className="font-display text-2xl font-semibold mb-1">Profile</h1>
            <p className="text-sm text-ink/50 mb-2">{profile.username} · {profile.email}</p>

            <Link to="/addresses" className="text-sm text-moss font-medium hover:underline">
                Manage saved addresses →
            </Link>

            <form onSubmit={handleSave} className="mt-8">

                <label className="block text-sm font-medium mb-1" htmlFor="phone">
                    Phone number
                </label>
                <input
                    id="phone"
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full border-0 border-b border-line bg-transparent pb-2 mb-6 outline-none focus:border-moss transition-colors"
                />

                <label className="block text-sm font-medium mb-1" htmlFor="bio">
                    Bio
                </label>
                <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full border border-line bg-transparent p-3 mb-6 outline-none focus:border-moss transition-colors rounded-sm resize-none"
                />

                <button
                    type="submit"
                    disabled={saving}
                    className="bg-moss text-paper text-sm font-medium px-6 py-2.5 rounded-sm hover:bg-moss-light transition-colors disabled:opacity-50"
                >
                    {saving ? "Saving…" : "Save changes"}
                </button>

                {saved && <span className="ml-4 text-sm text-moss">Saved.</span>}

            </form>

        </div>

    );

}

export default Profile;