"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUpload } from "@/hooks/useUpload";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { VALID_SUBJECTS } from "@/lib/pdf/taxonomy";
import { formatFileSize } from "@/lib/utils/format";
import { MIN_FILE_SIZE, MAX_FILE_SIZE } from "@/lib/pdf/limits";

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
      newErrors.file = `File too large. Maximum is ${formatFileSize(MAX_FILE_SIZE)}.`;
    else if (file.size < MIN_FILE_SIZE)
      newErrors.file = `File too small. Minimum is ${formatFileSize(MIN_FILE_SIZE)}.`;
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

      setFile(null);
      setTitle("");
      setDescription("");
      setSubject("");
      if (fileInputRef.current) fileInputRef.current.value = "";

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
    <form onSubmit={handleSubmit} className="auth-form">
      {/* File drop zone */}
      <div className="form-field">
        <label className="form-field__label">
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
          className={`dropzone ${dragOver ? "dropzone--active" : ""}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            hidden
            onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
          />

          {file ? (
            <div className="auth-brand">
              <div className="dropzone__icon">
                <svg
                  width="20"
                  height="20"
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
              <p className="card__name">{file.name}</p>
              <p className="pdf-meta">{formatFileSize(file.size)}</p>
              <p className="section-label">Click to change file</p>
            </div>
          ) : (
            <div className="auth-brand">
              <div className="dropzone__icon">
                <svg
                  width="20"
                  height="20"
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
              <p className="dropzone__text">
                <span className="section-label">Click to upload</span> or drag and drop
              </p>
              <p className="dropzone__subtext">
                PDF only · {formatFileSize(MIN_FILE_SIZE)} – {formatFileSize(MAX_FILE_SIZE)}
              </p>
            </div>
          )}
        </div>

        {errors.file && (
          <p className="form-field__error" role="alert">
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
      <div className="form-field">
        <label className="form-field__label">
          Subject
        </label>
        <select
          value={subject}
          onChange={(e) => {
            setSubject(e.target.value);
            setErrors((prev) => ({ ...prev, subject: "" }));
          }}
          disabled={upload.isPending}
          className={`select ${errors.subject ? "form-field__input--error" : ""}`}
        >
          <option value="">Select a subject…</option>
          {VALID_SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {errors.subject && (
          <p className="form-field__error" role="alert">
            {errors.subject}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="form-field">
        <label className="form-field__label">
          Description (optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of what this document covers…"
          rows={3}
          disabled={upload.isPending}
          maxLength={1000}
          className="form-field__input form-field__textarea"
        />
        <p className="form-field__hint">
          {description.length}/1000
        </p>
      </div>

      {/* Validation rules reminder */}
      <div className="card">
        <p className="form-field__label">
          Validation requirements
        </p>
        <ul className="home__section">
          {[
            "Valid PDF format (not image-only)",
            "File size: 100 KB – 50 MB",
            "At least 200 readable characters",
            "Content must match the selected subject",
          ].map((rule) => (
            <li key={rule} className="pdf-meta flex-row-item">
              <span className="logo__accent">✓</span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Submit error */}
      {errors.submit && (
        <div className="card">
          <p className="text-danger" role="alert">
            {errors.submit}
          </p>
        </div>
      )}

      {/* Success message */}
      {successMessage && (
        <div className="card">
          <p className="logo__accent">{successMessage}</p>
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        loading={upload.isPending}
        className="btn--full"
      >
        {upload.isPending ? "Uploading and validating…" : "Upload Document"}
      </Button>
    </form>
  );
}
