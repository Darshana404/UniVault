import { Header } from "@/components/layout/Header";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}