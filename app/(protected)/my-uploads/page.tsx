"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUserUploads } from "@/lib/my-uploads";
import { DocumentCard } from "@/components/documents/DocumentCard";
import { Spinner } from "@/components/ui/Spinner";
import type { Document } from "@/types/documents";

export default function ProtectedMyUploadsPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserUploads()
      .then(setDocs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="my-uploads-page">
      <Link href="/dashboard" className="pdf-detail__back">
        <svg
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span>Back to home</span>
      </Link>

      <div
        style={{
          background:
            "linear-gradient(135deg, #F0547C 0%, #F4917A 55%, #F9C4A8 100%)",
          padding: "20px 24px",
          width: "100%",
        }}
      >
        <div style={{ fontSize: "20px", fontWeight: 700, color: "#ffffff" }}>
          My Uploads
        </div>
        <div
          style={{
            fontSize: "13px",
            color: "rgba(255,255,255,0.8)",
            marginTop: "4px",
          }}
        >
          Documents uploaded by you
        </div>
      </div>

      {loading ? (
        <div className="home__empty">
          <Spinner size="md" />
        </div>
      ) : docs.length === 0 ? (
        <div className="home__empty">
          <p>No uploads yet</p>
        </div>
      ) : (
        <div className="my-uploads-grid">
          {docs.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      )}
    </div>
  );
}
