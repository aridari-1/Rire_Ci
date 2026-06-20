"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";

export default function Dashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [comedian, setComedian] = useState(null);
  const [stats, setStats] = useState({ totalTips: 0, totalSubscribers: 0, totalVideos: 0, balance: 0 });
  const [recentTips, setRecentTips] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!authLoading && !user) router.push("/auth");
  }, [user, authLoading]);

  useEffect(() => {
    if (user) fetchDashboard();
  }, [user]);

  async function fetchDashboard() {
    setLoading(true);
    const { data: comedianData } = await supabase.from("comedians").select("*").limit(1).single();
    if (!comedianData) { setLoading(false); return; }

    const { data: tipsData } = await supabase.from("tips").select("*")
      .eq("comedian_id", comedianData.id).eq("status", "completed")
      .order("created_at", { ascending: false });

    const { count: subCount } = await supabase.from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("comedian_id", comedianData.id).eq("status", "active");

    const { data: videosData } = await supabase.from("videos").select("*")
      .eq("comedian_id", comedianData.id).order("created_at", { ascending: false });

    const totalTips = tipsData?.reduce((sum, t) => sum + t.amount, 0) || 0;
    const balance = Math.round(totalTips * 0.85 + (subCount || 0) * 500 * 0.80);

    setComedian(comedianData);
    setStats({ totalTips, totalSubscribers: subCount || 0, totalVideos: videosData?.length || 0, balance });
    setRecentTips(tipsData?.slice(0, 10) || []);
    setVideos(videosData || []);
    setLoading(false);
  }

  if (authLoading || loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontSize: 28, fontWeight: 700 }}>rire<span style={{ color: "var(--accent)" }}>.</span>ci</p>
    </div>
  );

  if (!comedian) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24 }}>
      <i className="ti ti-user-off" style={{ fontSize: 40, color: "var(--text-3)" }} aria-hidden="true" />
      <p style={{ color: "var(--text-2)", textAlign: "center" }}>Aucun profil comédien trouvé.<br />Contacte l'équipe rire.ci.</p>
      <button onClick={() => router.push("/")} style={{ padding: "10px 20px", borderRadius: 8, background: "var(--accent)", color: "#fff", border: "none", fontWeight: 600 }}>Retour</button>
    </div>
  );

  const initials = comedian.name.split(" ").map((n) => n[0]).join("").toUpperCase();

  const TABS = [
    { id: "overview", label: "Aperçu", icon: "ti-chart-bar" },
    { id: "tips", label: "Tips", icon: "ti-coin" },
    { id: "videos", label: "Vidéos", icon: "ti-video" },
  ];

  return (
    <div style={{ minHeight: "100vh" }}>

      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 40,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 16px",
        background: "rgba(17,17,20,0.95)", backdropFilter: "blur(12px)",
        borderBottom: "0.5px solid var(--border)",
      }}>
        <span style={{ fontSize: 17, fontWeight: 700 }}>
          rire<span style={{ color: "var(--accent)" }}>.</span>ci
        </span>
        <button
          onClick={logout}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, background: "var(--bg-2)", border: "0.5px solid var(--border)", color: "var(--text-2)", fontSize: 13, fontWeight: 500 }}
        >
          <i className="ti ti-logout" style={{ fontSize: 15 }} aria-hidden="true" />
          Déconnexion
        </button>
      </nav>

      <div style={{ padding: "20px 16px 0" }}>

        {/* Profile row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: comedian.cover_color || "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
            {comedian.avatar_url
              ? <img src={comedian.avatar_url} alt={comedian.name} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
              : initials}
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700 }}>Bonjour, {comedian.name.split(" ")[0]} 👋</p>
            <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>Tableau de bord</p>
          </div>
        </div>

        {/* Balance card */}
        <div style={{ borderRadius: 14, background: "var(--bg-2)", border: "0.5px solid var(--border)", padding: "20px", marginBottom: 16 }}>
          <p style={{ fontSize: 12, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            Solde disponible
          </p>
          <p style={{ fontSize: 34, fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.02em" }}>
            {stats.balance.toLocaleString("fr-FR")}
            <span style={{ fontSize: 16, color: "var(--text-3)", marginLeft: 6, fontWeight: 400 }}>F CFA</span>
          </p>
          <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 8 }}>
            Après commission rire.ci (15% tips · 20% abonnements)
          </p>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 20 }}>
          {[
            { label: "Tips reçus", value: stats.totalTips.toLocaleString("fr-FR") + " F", icon: "ti-coin", color: "#FF4500" },
            { label: "Abonnés", value: stats.totalSubscribers, icon: "ti-star", color: "#F39C12" },
            { label: "Vidéos", value: stats.totalVideos, icon: "ti-video", color: "#3498DB" },
          ].map((stat) => (
            <div key={stat.label} style={{ borderRadius: 12, background: "var(--bg-2)", border: "0.5px solid var(--border)", padding: "14px 10px", textAlign: "center" }}>
              <i className={`ti ${stat.icon}`} style={{ fontSize: 20, color: stat.color }} aria-hidden="true" />
              <p style={{ fontSize: 15, fontWeight: 700, marginTop: 6 }}>{stat.value}</p>
              <p style={{ fontSize: 10, color: "var(--text-3)", marginTop: 3 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "0.5px solid var(--border)", position: "sticky", top: 62, background: "var(--bg)", zIndex: 30 }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: "12px 0",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              background: "none", border: "none",
              color: activeTab === tab.id ? "var(--text-1)" : "var(--text-3)",
              fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 400,
              borderBottom: activeTab === tab.id ? "2px solid var(--accent)" : "2px solid transparent",
            }}
          >
            <i className={`ti ${tab.icon}`} style={{ fontSize: 15 }} aria-hidden="true" />
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "16px 16px 24px" }}>

        {/* Overview tab */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Earnings breakdown */}
            <div style={{ borderRadius: 12, background: "var(--bg-2)", border: "0.5px solid var(--border)", overflow: "hidden" }}>
              {[
                { label: "Tips bruts", sub: "avant commission", value: stats.totalTips.toLocaleString("fr-FR") + " F" },
                { label: "Commission (15%)", sub: "", value: "− " + Math.round(stats.totalTips * 0.15).toLocaleString("fr-FR") + " F" },
                { label: "Abonnements nets", sub: `${stats.totalSubscribers} × 400 F`, value: Math.round(stats.totalSubscribers * 400).toLocaleString("fr-FR") + " F" },
              ].map((row, i) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "0.5px solid var(--border)" }}>
                  <div>
                    <p style={{ fontSize: 13, color: "var(--text-1)" }}>{row.label}</p>
                    {row.sub && <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{row.sub}</p>}
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{row.value}</p>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px" }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>Total net</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: "var(--accent)" }}>{stats.balance.toLocaleString("fr-FR")} F</p>
              </div>
            </div>

            {/* Quick actions */}
            <div style={{ borderRadius: 12, background: "var(--bg-2)", border: "0.5px solid var(--border)", overflow: "hidden" }}>
              {[
                { label: "Voir mon profil public", icon: "ti-user", action: () => router.push(`/comedien/${comedian.slug}`) },
                { label: "Ajouter une vidéo", icon: "ti-upload", action: () => router.push("/upload-video") },
              ].map((item, i) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "16px", background: "none", border: "none",
                    borderBottom: i === 0 ? "0.5px solid var(--border)" : "none",
                    color: "var(--text-1)", textAlign: "left",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--accent-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className={`ti ${item.icon}`} style={{ fontSize: 17, color: "var(--accent)" }} aria-hidden="true" />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</span>
                  </div>
                  <i className="ti ti-arrow-right" style={{ fontSize: 16, color: "var(--text-3)" }} aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tips tab */}
        {activeTab === "tips" && (
          recentTips.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-3)" }}>
              <i className="ti ti-coin-off" style={{ fontSize: 36 }} aria-hidden="true" />
              <p style={{ marginTop: 10, fontSize: 14 }}>Pas encore de tips reçus.</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>Partage ton profil pour en recevoir !</p>
            </div>
          ) : (
            <div style={{ borderRadius: 12, background: "var(--bg-2)", border: "0.5px solid var(--border)", overflow: "hidden" }}>
              {recentTips.map((tip, i) => (
                <div key={tip.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: i < recentTips.length - 1 ? "0.5px solid var(--border)" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--accent-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className="ti ti-coin" style={{ fontSize: 17, color: "var(--accent)" }} aria-hidden="true" />
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500 }}>Fan anonyme</p>
                      <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>
                        {new Date(tip.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>+{tip.amount.toLocaleString("fr-FR")} F</p>
                    <p style={{ fontSize: 10, color: "var(--text-3)", marginTop: 2 }}>net: {Math.round(tip.amount * 0.85).toLocaleString("fr-FR")} F</p>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Videos tab */}
        {activeTab === "videos" && (
          <div>
            <button
              onClick={() => router.push("/upload-video")}
              style={{ width: "100%", padding: "14px", borderRadius: 10, background: "var(--accent)", color: "#fff", border: "none", fontSize: 14, fontWeight: 600, marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <i className="ti ti-upload" style={{ fontSize: 16 }} aria-hidden="true" />
              Ajouter une vidéo
            </button>
            {videos.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-3)" }}>
                <i className="ti ti-video-off" style={{ fontSize: 36 }} aria-hidden="true" />
                <p style={{ marginTop: 10, fontSize: 14 }}>Aucune vidéo pour l'instant.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {videos.map((video) => (
                  <div key={video.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px", borderRadius: 12, background: "var(--bg-2)", border: "0.5px solid var(--border)" }}>
                    <div style={{ width: 52, height: 52, borderRadius: 8, background: "#1E1624", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <i className="ti ti-video" style={{ fontSize: 20, color: "var(--text-3)" }} aria-hidden="true" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{video.title}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                        <span style={{ fontSize: 11, color: video.is_locked ? "var(--accent)" : "var(--text-3)" }}>
                          {video.is_locked ? "Exclusif" : "Public"}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--text-3)" }}>·</span>
                        <span style={{ fontSize: 11, color: "var(--text-3)" }}>
                          {new Date(video.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                    </div>
                    <span style={{ fontSize: 12, color: "var(--text-3)", flexShrink: 0 }}>
                      {(video.views || 0).toLocaleString("fr-FR")} vues
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}