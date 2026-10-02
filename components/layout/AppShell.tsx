"use client";

import { useState } from "react";
import type { AuthUser } from "@/types/auth";
import Sidebar from "./Sidebar";
import styles from "./AppShell.module.css";

interface AppShellProps {
  user: AuthUser;
  children: React.ReactNode;
}

export default function AppShell({
  user,
  children,
}: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className={styles.shell}>
      <Sidebar
        user={user}
        collapsed={sidebarCollapsed}
        onToggle={() =>
          setSidebarCollapsed((current) => !current)
        }
      />

      <div
        className={`${styles.contentArea} ${
          sidebarCollapsed ? styles.contentAreaCollapsed : ""
        }`}
      >
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
}