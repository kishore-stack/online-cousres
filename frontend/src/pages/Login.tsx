import { useState } from "react";
import API from "../api/axios";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

/* ---------- RESPONSE TYPE ---------- */
type LoginResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
};

export default function Login() {
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ---------- INPUT CHANGE ---------- */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const res = await API.post<LoginResponse>("/auth/login", form);

      /* SET AUTH STATE */
      setAuth(
        res.data.user,
        res.data.accessToken,
        res.data.refreshToken
      );

      navigate("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-5"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Login
        </h2>

        {error && (
          <p className="bg-red-100 text-red-600 p-2 rounded text-sm text-center">
            {error}
          </p>
        )}

        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          required
          className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
          className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
        />

        <button
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <p className="text-center text-sm text-gray-600">
  Not registered?{" "}
  <span
    onClick={() => navigate("/register")}
    className="text-indigo-600 font-semibold cursor-pointer hover:underline"
  >
    Register here
  </span>
</p>
      </form>
    </div>
  );
}