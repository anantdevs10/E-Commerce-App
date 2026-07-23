import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function Login() {

    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    //stores what user types

    const handleLogin = async (e) => {

        e.preventDefault();

        try {

            const response = await api.post("token/", {
                username,
                password,
            });

            localStorage.setItem("access", response.data.access);
            localStorage.setItem("refresh", response.data.refresh);

            alert("Login successful!");

            navigate("/catalogue");

        } catch {

            alert("Invalid username or password.");

        }

    };

    return (

        <div>

            <h1>Login</h1>

            <form onSubmit={handleLogin}> 

                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <br /><br />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <br /><br />

                <button type="submit">
                    Login
                </button>

            </form>

        </div>

    );

}

export default Login;