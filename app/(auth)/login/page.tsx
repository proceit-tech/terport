"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";
import {
  authenticateMockUser,
  getSession,
  saveSession,
} from "@/lib/auth/session";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const session = getSession();

    if (session) {
      router.replace("/dashboard");
    }
  }, [router]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Ingrese su usuario y contraseña.");
      return;
    }

    const result = authenticateMockUser(username, password);

    if (!result.success || !result.user) {
      setError(result.message ?? "No fue posible iniciar sesión.");
      return;
    }

    saveSession(result.user, rememberMe);
    router.replace("/dashboard");
  }

  return (
    <main className={styles.page}>
      <section className={styles.brandPanel}>
        <div className={styles.overlay} />

        <div className={styles.brandContent}>
          <div className={styles.logoContainer}>
            <Image
              src="/logos/terport-logo.png"
              alt="TERPORT"
              width={250}
              height={110}
              priority
              className={styles.logo}
            />
          </div>

          <div className={styles.heroText}>
            <span className={styles.badge}>
              TERMINALES PORTUARIAS S.A.
            </span>

            <h1>Sistema Tarifario</h1>

            <p>
              Gestión de clientes, tarifas, servicios, cálculos y operaciones
              portuarias.
            </p>
          </div>

          <div className={styles.brandFooter}>
            <span>TERPORT</span>
            <span className={styles.separator}>•</span>
            <span>Gestión Portuaria</span>
          </div>
        </div>
      </section>

      <section className={styles.loginPanel}>
        <div className={styles.loginWrapper}>
          <div className={styles.mobileLogo}>
            <Image
              src="/logos/terport-logo.png"
              alt="TERPORT"
              width={150}
              height={70}
              priority
            />
          </div>

          <header className={styles.header}>
            <h2>Bienvenido</h2>
            <p>Ingrese sus credenciales para acceder al sistema.</p>
          </header>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label htmlFor="username">Usuario</label>

              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M20 21a8 8 0 0 0-16 0" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>

                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Ingrese su usuario"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </div>
            </div>

            <div className={styles.field}>
              <div className={styles.passwordHeader}>
                <label htmlFor="password">Contraseña</label>
              </div>

              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <rect x="4" y="10" width="16" height="11" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                </span>

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingrese su contraseña"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />

                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M3 3l18 18" />
                      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                      <path d="M9.9 4.2A10.4 10.4 0 0 1 12 4c5.5 0 9 8 9 8a17.5 17.5 0 0 1-2.1 3.2" />
                      <path d="M6.6 6.6C4.4 8.1 3 12 3 12s3.5 8 9 8a9.8 9.8 0 0 0 4-.8" />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className={styles.options}>
              <label className={styles.remember}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                <span>Recordarme</span>
              </label>

              <button type="button" className={styles.forgot}>
                ¿Olvidó su contraseña?
              </button>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button type="submit" className={styles.submit}>
              <span>Ingresar al sistema</span>

              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </button>
          </form>

          <div className={styles.security}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>

            <span>Acceso seguro y protegido</span>
          </div>
        </div>

        <footer className={styles.footer}>
          <span>© {new Date().getFullYear()} TERPORT S.A.</span>
          <span>Todos los derechos reservados</span>
        </footer>
      </section>
    </main>
  );
}