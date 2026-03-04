import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { signupApi, api } from "../services/api";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import { EyeOff, Eye } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function SignupPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const {isAuthenticated} = useAuth();



  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss();

    if (!form.name.trim()) {
      toast.error("Organization name is required");
      return;
    }
    if (!form.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!form.password.trim() || form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      await signupApi(form);
      // ✅ removed localStorage - cookies set by backend automatically
      toast.success("Account created successfully 🎉");
      setTimeout(() => navigate("/dashboard"), 500); // ✅ go to dashboard, not login
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Signup failed. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await api.post("auth/google/", { // ✅ removed leading slash
        token: credentialResponse.credential,
      });
      // ✅ removed localStorage
      toast.success("Welcome! 🚀");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      toast.error("Google login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8"
      >
        <h1 className="text-2xl font-extrabold text-indigo-600 text-center mb-4">
          ArenaOps
        </h1>

        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="text-sm text-gray-500 mt-1">Start managing your team smarter</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Organization name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter organization name"
              className="mt-1 w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@company.com"
              className="mt-1 w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="mt-1 w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              className="absolute mt-3 right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 opacity-70 hover:opacity-100"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg"
          >
            Sign up
          </motion.button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-200" />
          <span className="px-3 text-xs text-gray-400">OR</span>
          <div className="flex-grow h-px bg-gray-200" />
        </div>

        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => toast.error("Google login failed")}
        />

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 hover:underline">Login</Link>
        </p>
      </motion.div>
    </div>
  );
}