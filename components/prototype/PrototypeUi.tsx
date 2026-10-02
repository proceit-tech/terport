import Link from "next/link";
import styles from "./prototype-ui.module.css";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel,
}: PageHeaderProps) {
  return (
    <div className={styles.pageHeader}>
      <div>
        {eyebrow && <div className={styles.eyebrow}>{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>

      {actionHref && actionLabel && (
        <Link href={actionHref} className={styles.primaryButton}>
          + {actionLabel}
        </Link>
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  helper?: string;
}

export function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <div className={styles.statCard}>
      <span>{label}</span>
      <strong>{value}</strong>
      {helper && <small>{helper}</small>}
    </div>
  );
}

interface StatusBadgeProps {
  children: React.ReactNode;
  tone?: "info" | "success" | "warning" | "danger" | "neutral";
}

export function StatusBadge({
  children,
  tone = "info",
}: StatusBadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[`badge_${tone}`]}`}>
      {children}
    </span>
  );
}

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function Card({ title, subtitle, children }: CardProps) {
  return (
    <section className={styles.card}>
      {(title || subtitle) && (
        <div className={styles.cardHeader}>
          {subtitle && <div className={styles.eyebrow}>{subtitle}</div>}
          {title && <h2>{title}</h2>}
        </div>
      )}
      {children}
    </section>
  );
}

export { styles };
