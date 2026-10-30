"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LibraryRedirect({
  searchParams,
}: {
  searchParams?: Promise<{ subject?: string }>;
}) {
  const router = useRouter();
  const params = searchParams ? use(searchParams) : undefined;

  useEffect(() => {
    if (params?.subject) {
      router.replace(`/documents?subject=${encodeURIComponent(params.subject)}`);
    } else {
      router.replace("/documents");
    }
  }, [params, router]);

  return null;
}
