"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function SignupForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Signup failed");
      } else {
        router.push("/patient/dashboard");
        router.refresh();
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      onSubmit={onSubmit}
    >
      <Input
        label="Full Name"
        name="name"
        required
        placeholder="John Doe"
        value={form.name}
        onChange={(e) => update("name", e.target.value)}
      />
      <Input
        label="Email"
        name="email"
        type="email"
        required
        placeholder="you@example.com"
        value={form.email}
        onChange={(e) => update("email", e.target.value)}
      />
      <Input
        label="Phone"
        name="phone"
        required
        placeholder="9876543210"
        value={form.phone}
        onChange={(e) => update("phone", e.target.value)}
      />
      <Input
        label="Password"
        name="password"
        type="password"
        required
        minLength={6}
        placeholder="At least 6 characters"
        value={form.password}
        onChange={(e) => update("password", e.target.value)}
      />
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
          {error}
        </div>
      )}
      <Button type="submit" size="lg" disabled={loading}>
        {loading ? "Creating..." : "Create Account"}
      </Button>
    </form>
  );
}