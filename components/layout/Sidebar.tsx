"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { AuthUser } from "@/types/auth";
import { getMenuForRole, type MenuIcon } from "@/lib/auth/menu";
import { getRoleLabel } from "@/lib/auth/roles";
import { clearSession } from "@/lib/auth/session";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  user: AuthUser;
  collapsed: boolean;
  onToggle: () => void;
}

function MenuIconView({ icon }: { icon: MenuIcon }) {
  const commonProps = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  const icons: Record<MenuIcon, React.ReactNode> = {
    dashboard: <svg {...commonProps}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
    calculator: <svg {...commonProps}><rect x="5" y="2" width="14" height="20" rx="2" /><path d="M8 6h8" /><path d="M8 11h2M14 11h2M8 15h2M14 15h2M8 19h2M14 19h2" /></svg>,
    clients: <svg {...commonProps}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    tariffs: <svg {...commonProps}><path d="M20 12V7H4v10h16v-5Z" /><path d="M8 7V5h8v2" /><path d="M8 17v2h8v-2" /><path d="M8 12h8" /></svg>,
    services: <svg {...commonProps}><path d="M12 2 3 7l9 5 9-5-9-5Z" /><path d="m3 12 9 5 9-5" /><path d="m3 17 9 5 9-5" /></svg>,
    matrix: <svg {...commonProps}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M3 15h18M9 3v18M15 3v18" /></svg>,
    orders: <svg {...commonProps}><path d="M6 2h9l3 3v17H6z" /><path d="M14 2v5h5M9 12h6M9 16h6" /></svg>,
    proformas: <svg {...commonProps}><path d="M4 3h16v18H4z" /><path d="M8 7h8M8 11h8M8 15h5" /></svg>,
    groups: <svg {...commonProps}><circle cx="8" cy="8" r="3" /><circle cx="16" cy="8" r="3" /><path d="M2 20a6 6 0 0 1 12 0M10 20a6 6 0 0 1 12 0" /></svg>,
    brokers: <svg {...commonProps}><path d="M3 21h18M5 21V8l7-5 7 5v13" /><path d="M9 21v-6h6v6" /></svg>,
    users: <svg {...commonProps}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>,
    audit: <svg {...commonProps}><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></svg>,
    settings: <svg {...commonProps}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34A1.7 1.7 0 0 0 14 20.93V21h-4v-.09A1.7 1.7 0 0 0 8.97 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15 1.7 1.7 0 0 0 3.09 14H3v-4h.09A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 8.97 4.6 1.7 1.7 0 0 0 10 3.09V3h4v.09a1.7 1.7 0 0 0 1.03 1.51 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.14.4.5.74 1.51 1H21v4h-.09c-1.01.26-1.37.6-1.51 1Z" /></svg>,
  };

  return icons[icon];
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={open ? styles.chevronOpen : styles.chevron}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default function Sidebar({ user, collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const menuGroups = getMenuForRole(user.role);

  const initialGroupState = useMemo(() => {
    const state: Record<string, boolean> = {};

    menuGroups.forEach((group) => {
      const containsActiveItem = group.items.some(
        (item) =>
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`))
      );

      state[group.label] = containsActiveItem || group.label === "General";
    });

    return state;
  }, [menuGroups, pathname]);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(initialGroupState);

  function toggleGroup(groupLabel: string) {
    setOpenGroups((current) => ({
      ...current,
      [groupLabel]: !current[groupLabel],
    }));
  }

  function handleLogout() {
    clearSession();
    router.replace("/login");
  }

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""}`}>
      <div className={styles.brand}>
        <Image
          src="/logos/terport-logo.png"
          alt="TERPORT"
          width={140}
          height={60}
          priority
          className={styles.logo}
        />

        <button
          type="button"
          className={styles.toggleButton}
          onClick={onToggle}
          aria-label={collapsed ? "Mostrar menú" : "Ocultar menú"}
          title={collapsed ? "Mostrar menú" : "Ocultar menú"}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {collapsed ? (
              <>
                <path d="m9 18 6-6-6-6" />
                <path d="M4 5v14" />
              </>
            ) : (
              <>
                <path d="m15 18-6-6 6-6" />
                <path d="M20 5v14" />
              </>
            )}
          </svg>
        </button>
      </div>

      <div className={styles.profile}>
        <div className={styles.avatar}>{user.displayName.charAt(0).toUpperCase()}</div>
        {!collapsed && (
          <div className={styles.profileText}>
            <strong>{user.displayName}</strong>
            <span>{getRoleLabel(user.role)}</span>
          </div>
        )}
      </div>

      <nav className={styles.nav}>
        {menuGroups.map((group) => {
          const isOpen = collapsed ? true : Boolean(openGroups[group.label]);

          return (
            <div className={styles.group} key={group.label}>
              {!collapsed && (
                <button
                  type="button"
                  className={styles.groupHeader}
                  onClick={() => toggleGroup(group.label)}
                  aria-expanded={isOpen}
                >
                  <span>{group.label}</span>
                  <ChevronIcon open={isOpen} />
                </button>
              )}

              {isOpen && (
                <div className={styles.groupItems}>
                  {group.items.map((item) => {
                    const active =
                      pathname === item.href ||
                      (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        className={`${styles.navItem} ${active ? styles.active : ""}`}
                      >
                        <span className={styles.activeIndicator} />
                        <span className={styles.icon}><MenuIconView icon={item.icon} /></span>
                        {!collapsed && <span className={styles.label}>{item.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <button type="button" className={styles.logoutButton} onClick={handleLogout} title="Cerrar sesión">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="m16 17 5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
          {!collapsed && <span>Cerrar sesión</span>}
        </button>

        {!collapsed && (
          <div className={styles.institution}>
            <span>TERPORT S.A.</span>
            <small>Sistema Institucional</small>
          </div>
        )}
      </div>
    </aside>
  );
}