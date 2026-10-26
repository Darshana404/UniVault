"use client";

import Link from "next/link";
import { useCurrentUser } from "@/hooks/useAuth";
import { useDocuments } from "@/hooks/useDocuments";
import { DocumentList } from "@/components/documents/DocumentList";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const { data: user } = useCurrentUser();

  // Fetch the 5 most recent approved documents
  const { data, isLoading, error } = useDocuments({
    limit: 5,
    sort: "created_at",
    order: "desc",
  });

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {user?.email}
          </p>
        </div>
        <Link href="/upload">
          <Button variant="primary">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Upload PDF
          </Button>
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <p className="text-sm text-slate-400">Total Documents</p>
          <p className="text-3xl font-bold text-white mt-1">
            {data?.pagination.total ?? "—"}
          </p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <p className="text-sm text-slate-400">Browse All</p>
          <Link href="/documents">
            <p className="text-teal-400 font-semibold mt-1 hover:text-teal-300 transition-colors">
              View library →
            </p>
          </Link>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <p className="text-sm text-slate-400">Upload</p>
          <Link href="/upload">
            <p className="text-teal-400 font-semibold mt-1 hover:text-teal-300 transition-colors">
              Share a PDF →
            </p>
          </Link>
        </div>
      </div>

      {/* Recent documents */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            Recently Added
          </h2>
          <Link
            href="/documents"
            className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
          >
            View all
          </Link>
        </div>

        <DocumentList
          documents={data?.data ?? []}
          isLoading={isLoading}
          error={error}
          currentUserId={user?.id}
        />
      </div>
    </div>
  );
}
