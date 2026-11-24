import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { AUTH_SESSION_CHANGED_EVENT, AUTH_TOKEN_KEY, clearAuthSession } from "../../features/auth/services/authStorage";
import { AuthSessionContext } from "./authSessionContext";
import "./SessionExpiredModal.scss";

const SESSION_EXPIRED_EVENT = "vet:session-expired";

function tokenExpiration(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(base64.length + ((4 - base64.length % 4) % 4), "=");
    const decoded = JSON.parse(atob(paddedBase64)) as { exp?: unknown };
    return typeof decoded.exp === "number" ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
}

function tokenIsExpired(token: string | null): boolean {
  if (!token) return false;
  const expiresAt = tokenExpiration(token);
  return expiresAt === null || expiresAt <= Date.now();
}

function SessionExpiredModal() {
  const navigate = useNavigate();

  const returnToLogin = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  return (
    <div className="session-expired-overlay">
      <section
        className="session-expired-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="session-expired-title"
        aria-describedby="session-expired-description"
      >
        <div className="session-expired-modal__icon"><LogIn size={25} /></div>
        <h2 id="session-expired-title">Tu sesión expiró</h2>
        <p id="session-expired-description">
          Por seguridad, iniciá sesión nuevamente para seguir usando la aplicación.
        </p>
        <button type="button" autoFocus onClick={returnToLogin}>
          Iniciar sesión
        </button>
      </section>
    </div>
  );
}

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [isExpired, setIsExpired] = useState(() =>
    tokenIsExpired(localStorage.getItem(AUTH_TOKEN_KEY)),
  );

  useEffect(() => {
    let expirationTimer: number | undefined;

    const clearExpirationTimer = () => {
      if (expirationTimer !== undefined) window.clearTimeout(expirationTimer);
    };

    const syncSession = () => {
      clearExpirationTimer();
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        setIsExpired(false);
        return;
      }

      const expiresAt = tokenExpiration(token);
      if (expiresAt === null || expiresAt <= Date.now()) {
        setIsExpired(true);
        return;
      }

      setIsExpired(false);
      expirationTimer = window.setTimeout(
        syncSession,
        Math.min(expiresAt - Date.now(), 2_147_000_000),
      );
    };

    const handleUnauthorized = () => {
      clearExpirationTimer();
      setIsExpired(true);
    };

    syncSession();
    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, syncSession);
    window.addEventListener("storage", syncSession);
    window.addEventListener(SESSION_EXPIRED_EVENT, handleUnauthorized);

    return () => {
      clearExpirationTimer();
      window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, syncSession);
      window.removeEventListener("storage", syncSession);
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleUnauthorized);
    };
  }, []);

  return (
    <AuthSessionContext.Provider value={isExpired}>
      <div inert={isExpired} aria-hidden={isExpired}>
        {children}
      </div>
      {isExpired && <SessionExpiredModal />}
    </AuthSessionContext.Provider>
  );
}
