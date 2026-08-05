import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

function Login() {

    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {

        e.preventDefault();
        setError("");

        try {

            const response = await api.post("token/", {
                username,
                password,
            });

            localStorage.setItem("access", response.data.access);
            localStorage.setItem("refresh", response.data.refresh);

            navigate("/catalogue");

        } catch {

            setError("Incorrect username or password.");

        }

    };

    return (

        <div className="min-h-screen flex font-body">

            <div className="hidden md:flex md:w-2/5 bg-moss text-paper flex-col justify-between p-12">
                <span className="font-display font-semibold text-xl tracking-tight">Storefront</span>
                <p className="font-display text-3xl leading-snug max-w-xs">
                    Good things, plainly made.
                </p>
                <span className="text-sm text-sand/70">© 2026 Storefront</span>
            </div>

            <div className="flex-1 flex items-center justify-center p-8">
                <form onSubmit={handleLogin} className="w-full max-w-sm">

                    <h1 className="font-display text-2xl font-semibold mb-1">Sign in</h1>
                    <p className="text-sm text-ink/60 mb-8">Welcome back — enter your details below.</p>

                    <label className="block text-sm font-medium mb-1" htmlFor="username">
                        Username
                    </label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full border-0 border-b border-line bg-transparent pb-2 mb-6 outline-none focus:border-moss transition-colors"
                        autoComplete="username"
                    />

                    <label className="block text-sm font-medium mb-1" htmlFor="password">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border-0 border-b border-line bg-transparent pb-2 mb-2 outline-none focus:border-moss transition-colors"
                        autoComplete="current-password"
                    />

                    {error && (
                        <p className="text-sm text-red-700 mt-2">{error}</p>
                    )}

                    <button
                        type="submit"
                        className="w-full mt-8 bg-moss text-paper font-medium py-2.5 rounded-sm hover:bg-moss-light transition-colors"
                    >
                        Sign in
                    </button>

                    <p className="text-sm text-ink/60 mt-6 text-center">
                        New here?{" "}
                        <Link to="/register" className="text-moss font-medium hover:underline">
                            Create an account
                        </Link>
                    </p>

                </form>
            </div>

        </div>

    );

}

export default Login;