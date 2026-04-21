"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function BookingForm({
  testId,
  testName,
  price,
  defaultName,
}: {
  testId: string;
  testName: string;
  price: number;
  defaultName: string;
}) {
  const router = useRouter();
  const [patientName, setPatientName] = useState(defaultName);
  const [patientPhone, setPatientPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState<"card" | "upi" | "cash">("card");
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId, patientName, patientPhone, notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Booking failed");
        setLoading(false);
        return;
      }
      router.push(`/patient/requests/${data.request.id}?booked=1`);
      router.refresh();
    } catch {
      setError("Network error");
      setLoading(false);
    }
  }

  if (step === 2) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Payment
          </div>
          <div className="mt-3 space-y-2">
            {[
              { id: "card", label: "💳 Credit / Debit Card" },
              { id: "upi", label: "📱 UPI" },
              { id: "cash", label: "💵 Pay at clinic" },
            ].map((opt) => (
              <label
                key={opt.id}
                className={
                  "flex cursor-pointer items-center gap-3 rounded-xl border p-3 " +
                  (payment === opt.id
                    ? "border-[#1e7fd6] bg-[#e8f2fc]"
                    : "border-slate-200 bg-white")
                }
              >
                <input
                  type="radio"
                  name="payment"
                  value={opt.id}
                  checked={payment === opt.id}
                  onChange={() =>
                    setPayment(opt.id as "card" | "upi" | "cash")
                  }
                />
                <span className="text-sm font-medium text-slate-800">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
          <div className="mt-4 border-t border-slate-200 pt-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{testName}</span>
              <span className="font-semibold text-slate-900">₹{price}</span>
            </div>
            <div className="mt-1 flex justify-between text-sm">
              <span className="text-slate-500">Service fee</span>
              <span className="font-semibold text-slate-900">₹0</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 text-base">
              <span className="font-bold text-slate-900">Total</span>
              <span className="font-bold text-[#1e7fd6]">₹{price}</span>
            </div>
          </div>
        </div>
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
            {error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setStep(1)}
            disabled={loading}
          >
            Back
          </Button>
          <Button size="lg" onClick={submit} disabled={loading}>
            {loading ? "Processing..." : `Pay ₹${price}`}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!patientName || !patientPhone) {
          setError("Name and phone are required");
          return;
        }
        setStep(2);
      }}
      className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4"
    >
      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
        Patient Details
      </div>
      <Input
        label="Full Name"
        value={patientName}
        onChange={(e) => setPatientName(e.target.value)}
        required
      />
      <Input
        label="Phone"
        value={patientPhone}
        onChange={(e) => setPatientPhone(e.target.value)}
        placeholder="9876543210"
        required
      />
      <Textarea
        label="Notes for the clinic (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Allergies, special instructions..."
      />
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
          {error}
        </div>
      )}
      <Button type="submit" size="lg">
        Continue to Payment
      </Button>
    </form>
  );
}