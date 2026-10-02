"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { AuthUser } from "@/types/auth";
import { getSession } from "@/lib/auth/session";
import AppShell from "@/components/layout/AppShell";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();

    if (!session) {
      router.replace("/login");
      return;
    }

    setUser(session);
    setLoading(false);
  }, [router, pathname]);

  if (loading || !user) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f5f7fa",
          color: "#627d98",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        Cargando...
      </main>
    );
  }

  return <AppShell user={user}>{children}</AppShell>;
}