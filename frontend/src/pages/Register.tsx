import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brain } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/primitives";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(fullName, email, password);
      toast.success("Account created");
      navigate("/app");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center mb-3">
            <Brain size={19} className="text-white" />
          </div>
          <h1 className="text-lg font-semibold text-ink-900">Create your account</h1>
          <p className="text-sm text-ink-500 mt-1">Start analyzing papers in minutes</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-2xl shadow-card p-6 flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-ink-700 block mb-1.5">Full name</label>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ada Lovelace"
              className="w-full border border-border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-brand-400"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700 block mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@university.edu"
              className="w-full border border-border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-brand-400"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700 block mb-1.5">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full border border-border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-brand-400"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full mt-1">
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="text-sm text-ink-500 text-center mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-brand-600 font-medium hover:text-brand-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
