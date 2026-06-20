"use client";

import { useRouter, usePathname } from "next/navigation";

const NAV_ITEMS = [
  { id: "home", label: "Accueil", icon: "ti-home", path: "/" },
  { id: "search", label: "Recherche", icon: "ti-search", path: "/recherche" },
  { id: "comedien", label: "Comédien", icon: "ti-microphone", path: "/devenir-comedien" },
  { id: "dashboard", label: "Dashboard", icon: "ti-layout-dashboard", path: "/dashboard" },
];

export default function AppLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const hideNav = pathname === "/auth";

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", maxWidth: 480, margin: "0 auto", position: "relative" }}>
      <main style={{ paddingBottom: hideNav ? 0 : 64 }}>
        {children}
      </main>

      {!hideNav && (
        <nav
          style={{
            position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
            width: "100%", maxWidth: 480,
            background: "var(--bg)",
            borderTop: "0.5px solid var(--border)",
            display: "flex",
            zIndex: 50,
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path ||
              (item.path !== "/" && pathname?.startsWith(item.path));
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                style={{
                  flex: 1, display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 3,
                  padding: "10px 0 8px",
                  background: "none", border: "none",
                  color: isActive ? "var(--accent)" : "var(--text-3)",
                  transition: "color 0.15s",
                }}
              >
                <i className={`ti ${item.icon}`} style={{ fontSize: 22 }} aria-hidden="true" />
                <span style={{ fontSize: 10, fontWeight: 500 }}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}