"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LabRequest } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";

export default function LabUpload({ request }: { request: LabRequest }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [labNotes, setLabNotes] = useState(request.labNotes || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Please select a file");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("labNotes", labNotes);
      const res = await fetch(`/api/requests/${request.id}/report`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed");
      } else {
        setUploadSuccess(true);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  // Show success screen after upload
  if (uploadSuccess) {
    return (
      <Card className="border-emerald-200 bg-emerald-50">
        <div className="flex flex-col items-center py-4 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <svg
              className="h-8 w-8 text-emerald-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div className="mb-1 text-lg font-bold text-emerald-800">
            Report Sent Successfully!
          </div>
          <p className="mb-4 text-sm text-emerald-700">
            The report has been uploaded and is awaiting admin release.
          </p>
          <Button
            type="button"
            size="lg"
            variant="secondary"
            onClick={() => router.push("/mainlab/requests")}
          >
            ← Go Back to Requests
          </Button>
        </div>
      </Card>
    );
  }

  if (request.status === "delivered") {
    return (
      <Card className="border-emerald-200 bg-emerald-50">
        <div className="mb-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
          Delivered
        </div>
        <p className="text-sm text-emerald-800">
          Report was delivered to patient via Admin.
        </p>
        {request.reportDataUrl && (
          <a
            href={`/api/requests/${request.id}/report`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex h-10 items-center justify-center rounded-xl border border-emerald-300 bg-white px-4 text-xs font-semibold text-emerald-700"
          >
            View Report
          </a>
        )}
      </Card>
    );
  }

  if (request.status === "report_ready") {
    return (
      <Card className="border-teal-200 bg-teal-50">
        <div className="flex flex-col items-center py-4 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-teal-100">
            <svg
              className="h-8 w-8 text-teal-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div className="mb-1 text-lg font-bold text-teal-800">
            Report Sent Successfully
          </div>
          <p className="mb-2 text-sm text-teal-700">
            {request.reportFileName || "report"} — awaiting admin release.
          </p>
          <a
            href={`/api/requests/${request.id}/report`}
            target="_blank"
            rel="noreferrer"
            className="mb-3 inline-flex h-10 items-center justify-center rounded-xl border border-teal-300 bg-white px-4 text-xs font-semibold text-teal-700"
          >
            View Uploaded Report
          </a>
          <Button
            type="button"
            size="lg"
            variant="secondary"
            onClick={() => router.push("/mainlab/requests")}
          >
            ← Go Back to Requests
          </Button>
        </div>
      </Card>
    );
  }

  if (request.status === "forwarded") {
    return (
      <Card>
        <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          Upload Report
        </div>
        <p className="mb-3 text-xs text-slate-500">
          Attach the generated report (any document type accepted).
        </p>
        <UploadForm onSubmit={upload} file={file} setFile={setFile} labNotes={labNotes} setLabNotes={setLabNotes} loading={loading} error={error} />
      </Card>
    );
  }

  return (
    <Card>
      <p className="text-sm text-slate-600">
        This request is not awaiting lab action.
      </p>
    </Card>
  );
}

function UploadForm({
  onSubmit,
  file,
  setFile,
  labNotes,
  setLabNotes,
  loading,
  error,
}: {
  onSubmit: (e: React.FormEvent) => void;
  file: File | null;
  setFile: (f: File | null) => void;
  labNotes: string;
  setLabNotes: (s: string) => void;
  loading: boolean;
  error: string;
}) {
  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-slate-600">
          Report file (any document type)
        </span>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full rounded-xl border border-slate-300 bg-white p-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-teal-600 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
        />
        {file && (
          <p className="mt-1 text-[11px] text-slate-500">
            Selected: {file.name} ({Math.round(file.size / 1024)} KB)
          </p>
        )}
      </label>
      <Textarea
        label="Lab notes (optional)"
        value={labNotes}
        onChange={(e) => setLabNotes(e.target.value)}
        placeholder="Any observations or remarks for the admin..."
      />
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
          {error}
        </div>
      )}
      <Button
        type="submit"
        size="lg"
        variant="secondary"
        disabled={loading || !file}
      >
        {loading ? "Uploading..." : "Upload Report"}
      </Button>
    </form>
  );
}
