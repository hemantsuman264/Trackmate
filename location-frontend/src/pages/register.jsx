import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import "./register.css";

const Register = () => {
    const [form, setForm] = useState({ username: "", email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.username || !form.email || !form.password) {
            setError("All fields are required!");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await API.post("/auth/register", form);
            alert("Registered successfully! Please login.");
            setForm({ username: "", email: "", password: "" });
            navigate("/login");
        } catch (err) {
            setError("Registration failed. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <form className="form-box" onSubmit={handleSubmit}>
                <h2>Register</h2>
                <input
                    type="text"
                    placeholder="Username"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Registering..." : "Register"}
                </button>
                {error && <div className="error">{error}</div>}
                <p className="switch-link">
                    Already have an account? <span onClick={() => navigate("/")}>Login</span>
                </p>
            </form>
        </div>
    );
};

export default Register;
