"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUpload } from "@/hooks/useUpload";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { VALID_SUBJECTS } from "@/lib/pdf/taxonomy";
import { formatFileSize } from "@/lib/utils/format";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MIN_FILE_SIZE = 100 * 1024;

export function UploadForm() {
  const router = useRouter();
  const upload = useUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (!file) newErrors.file = "Please select a PDF file.";
    else if (file.size > MAX_FILE_SIZE)
      newErrors.file = `File too large. Maximum is 50 MB.`;
    else if (file.size < MIN_FILE_SIZE)
      newErrors.file = `File too small. Minimum is 100 KB.`;
    else if (!file.name.toLowerCase().endsWith(".pdf"))
      newErrors.file = "Only PDF files are accepted.";

    if (!title.trim()) newErrors.title = "Title is required.";
    else if (title.trim().length < 3)
      newErrors.title = "Title must be at least 3 characters.";

    if (!subject) newErrors.subject = "Please select a subject.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleFileSelect(selected: File | null) {
    if (!selected) return;
    setFile(selected);
    setErrors((prev) => ({ ...prev, file: "" }));

    // Auto-fill title from filename if empty
    if (!title) {
      const nameWithoutExt = selected.name.replace(/\.pdf$/i, "");
      setTitle(nameWithoutExt);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMessage("");

    if (!validateForm() || !file) return;

    try {
      const result = await upload.mutateAsync({
        file,
        title: title.trim(),
        description: description.trim() || undefined,
        subject,
      });

      setSuccessMessage(
        `"${result.document.title}" uploaded and approved successfully.`
      );

      // Reset form
      setFile(null);
      setTitle("");
      setDescription("");
      setSubject("");
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Redirect to document detail after short delay
      setTimeout(() => {
        router.push(`/documents/${result.document.id}`);
      }, 1500);
    } catch (err) {
      setErrors({
        submit:
          err instanceof Error ? err.message : "Upload failed. Please try again.",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* File drop zone */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          PDF File
        </label>
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
            transition-colors duration-200
            ${dragOver
              ? "border-teal-400 bg-teal-500/10"
              : file
              ? "border-teal-500/50 bg-teal-500/5"
              : "border-slate-600 hover:border-slate-500 bg-slate-800/50"
            }
            ${errors.file ? "border-red-500" : ""}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
          />

          {file ? (
            <div className="space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-500/20">
                <svg
                  className="w-6 h-6 text-teal-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-200">{file.name}</p>
              <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
              <p className="text-xs text-teal-400">Click to change file</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-700">
                <svg
                  className="w-6 h-6 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <p className="text-sm text-slate-300">
                <span className="text-teal-400 font-medium">
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>
              <p className="text-xs text-slate-500">
                PDF only · 100 KB – 50 MB
              </p>
            </div>
          )}
        </div>

        {errors.file && (
          <p className="mt-1.5 text-sm text-red-400" role="alert">
            {errors.file}
          </p>
        )}
      </div>

      {/* Title */}
      <Input
        label="Title"
        type="text"
        placeholder="e.g. Calculus Notes — Chapter 5"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          setErrors((prev) => ({ ...prev, title: "" }));
        }}
        error={errors.title}
        disabled={upload.isPending}
      />

      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Subject
        </label>
        <select
          value={subject}
          onChange={(e) => {
            setSubject(e.target.value);
            setErrors((prev) => ({ ...prev, subject: "" }));
          }}
          disabled={upload.isPending}
          className={`
            w-full px-4 py-2.5 rounded-lg text-slate-100 bg-slate-800
            border transition-colors focus:outline-none focus:ring-2
            focus:ring-teal-500 focus:border-transparent
            disabled:opacity-50
            ${errors.subject ? "border-red-500" : "border-slate-700"}
          `}
        >
          <option value="">Select a subject…</option>
          {VALID_SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {errors.subject && (
          <p className="mt-1.5 text-sm text-red-400" role="alert">
            {errors.subject}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Description{" "}
          <span className="text-slate-500 font-normal">(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of what this document covers…"
          rows={3}
          disabled={upload.isPending}
          maxLength={1000}
          className="w-full px-4 py-2.5 rounded-lg text-slate-100 placeholder-slate-500 bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 resize-none"
        />
        <p className="mt-1 text-xs text-slate-500 text-right">
          {description.length}/1000
        </p>
      </div>

      {/* Validation rules reminder */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-1">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
          Validation requirements
        </p>
        <ul className="space-y-1 mt-2">
          {[
            "Valid PDF format (not image-only)",
            "File size: 100 KB – 50 MB",
            "At least 200 readable characters",
            "Content must match the selected subject",
          ].map((rule) => (
            <li key={rule} className="flex items-center gap-2 text-xs text-slate-400">
              <svg
                className="w-3 h-3 text-teal-500 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {rule}
            </li>
          ))}
        </ul>
      </div>

      {/* Submit error */}
      {errors.submit && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-sm text-red-400" role="alert">
            {errors.submit}
          </p>
        </div>
      )}

      {/* Success message */}
      {successMessage && (
        <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-4">
          <p className="text-sm text-teal-400">{successMessage}</p>
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        loading={upload.isPending}
        className="w-full"
      >
        {upload.isPending ? "Uploading and validating…" : "Upload Document"}
      </Button>
    </form>
  );
}

