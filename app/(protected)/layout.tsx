import { Header } from "@/components/layout/Header";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="layout">
      <Header />
      <main className="layout__main">{children}</main>
    </div>
  );
}
