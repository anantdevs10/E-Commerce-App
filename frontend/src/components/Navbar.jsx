import { Link, useNavigate } from "react-router-dom";

function Navbar() {

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        navigate("/");
    };

    return (

        <nav className="flex items-center justify-between px-8 py-4 border-b border-line bg-paper">

            <Link to="/catalogue" className="font-display font-semibold text-lg tracking-tight text-ink">
                Storefront
            </Link>

            <div className="flex items-center gap-6 text-sm font-medium">

                <Link to="/catalogue" className="text-ink/70 hover:text-moss transition-colors">
                    Catalogue
                </Link>

                <Link to="/cart" className="text-ink/70 hover:text-moss transition-colors">
                    Cart
                </Link>

                <button
                    onClick={handleLogout}
                    className="text-ink/50 hover:text-moss transition-colors"
                >
                    Sign out
                </button>

            </div>

        </nav>

    );

}

export default Navbar;