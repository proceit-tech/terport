"use client";

import type { AuthUser } from "@/types/auth";
import { getRoleLabel } from "@/lib/auth/roles";
import styles from "./Header.module.css";

interface HeaderProps { user: AuthUser; }

export default function Header({ user }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div><span className={styles.institution}>TERPORT S.A.</span></div>
      <div className={styles.userInfo}>
        <strong>{user.displayName}</strong>
        <span>{getRoleLabel(user.role)}</span>
      </div>
    </header>
  );
}
