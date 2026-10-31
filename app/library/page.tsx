import { redirect } from "next/navigation";

export default async function LibraryRedirect({
  searchParams,
}: {
  searchParams?: Promise<{ subject?: string; q?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const query = new URLSearchParams();

  if (params?.subject) {
    query.set("subject", params.subject);
  }
  if (params?.q) {
    query.set("q", params.q);
  }

  const qs = query.toString();
  redirect(qs ? `/documents?${qs}` : "/documents");
}
