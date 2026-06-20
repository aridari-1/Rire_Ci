"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";

export default function Dashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [comedian, setComedian] = useState(null);
  const [stats, setStats] = useState({ totalTips: 0, totalSubscribers: 0, totalVideos: 0, pendingBalance: 0 });
  const [recentTips, setRecentTips] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (user) fetchDashboard();
  }, [user]);

  async function fetchDashboard() {
    setLoading(true);

    // For now we match comedian by email
    // Later you'll have a proper comedian <-> user link
    const { data: comedianData } = await supabase
      .from("comedians")
      .select("*")
      .limit(1)
      .single();

    if (!comedianData) {
      setLoading(false);
      return;
    }

    // Tips
    const { data: tipsData } = await supabase
      .from("tips")
      .select("*")
      .eq("comedian_id", comedianData.id)
      .eq("status", "completed")
      .order("created_at", { ascending: false });

    // Subscribers
    const { count: subCount } = await supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("comedian_id", comedianData.id)
      .eq("status", "active");

    // Videos
    const { data: videosData } = await supabase
      .from("videos")
      .select("*")
      .eq("comedian_id", comedianData.id)
      .order("created_at", { ascending: false });

    const totalTips = tipsData?.reduce((sum, t) => sum + t.amount, 0) || 0;
    const monthlyFromSubs = (subCount || 0) * 500;
    // Your platform takes 15% cut on tips, 20% on subs
    const earnings = Math.round(totalTips * 0.85 + monthlyFromSubs * 0.80);

    setComedian(comedianData);
    setStats({
      totalTips: totalTips,
      totalSubscribers: subCount || 0,
      totalVideos: videosData?.length || 0,
      pendingBalance: earnings,
    });
    setRecentTips(tipsData?.slice(0, 10) || []);
    setVideos(videosData || []);
    setLoading(false);
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0E0C0A" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 700, color: "#FFD600" }}>
            rire<span style={{ color: "#FF6B2B" }}>.ci</span>
          </h1>
          <p style={{ color: "#6B6560", fontSize: 13, marginTop: 8 }}>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!comedian) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#0E0C0A", color: "#F5F0EB" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48 }}>🎭</div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, marginTop: 12 }}>
            Aucun profil comédien trouvé
          </h2>
          <p style={{ color: "#6B6560", fontSize: 14, marginTop: 8 }}>
            Contacte l'équipe rire.ci pour créer ton profil.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 px-6 py-3 rounded-xl"
            style={{ background: "#FF6B2B", color: "#fff", fontSize: 14, fontWeight: 700 }}
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const initials = comedian.name.split(" ").map((n) => n[0]).join("").toUpperCase();

  return (
    <div className="min-h-screen" style={{ background: "#0E0C0A", color: "#F5F0EB" }}>

      {/* Nav */}
      <nav
        className="sticky top-0 z-40 flex items-center justify-between px-4 py-3"
        style={{ background: "rgba(14,12,10,0.92)", backdropFilter: "blur(12px)", borderBottom: "0.5px solid #2A2420" }}
      >
        <button onClick={() => router.push("/")} style={{ color: "#FF6B2B", fontSize: 22 }}>←</button>
        <span style={{ fontFamily: "Georgia, serif", fontSize: 17, fontWeight: 700, color: "#FFD600" }}>
          rire<span style={{ color: "#FF6B2B" }}>.ci</span>
        </span>
        <button onClick={logout} style={{ fontSize: 12, color: "#6B6560", fontWeight: 600 }}>
          Déconnexion
        </button>
      </nav>

      <div className="px-4 pb-24">

        {/* Header */}
        <div className="flex items-center gap-4 mt-6 mb-6">
          <div
            style={{
              width: 56, height: 56, borderRadius: "50%",
              background: comedian.cover_color,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, color: "#fff",
              flexShrink: 0,
            }}
          >
            {comedian.avatar_url
              ? <img src={comedian.avatar_url} alt={comedian.name} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
              : initials}
          </div>
          <div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700 }}>
              Bonjour, {comedian.name.split(" ")[0]} 👋
            </h1>
            <p style={{ fontSize: 12, color: "#6B6560", marginTop: 2 }}>Tableau de bord comédien</p>
          </div>
        </div>

        {/* Balance card */}
        <div
          className="rounded-2xl p-5 mb-6"
          style={{
            background: "linear-gradient(135deg, #FF6B2B22 0%, #FFD60011 100%)",
            border: "0.5px solid #FF6B2B44",
          }}
        >
          <p style={{ fontSize: 12, color: "#A09890", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Solde disponible (après commission)
          </p>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 36, fontWeight: 700, color: "#FFD600", marginTop: 4 }}>
            {stats.pendingBalance.toLocaleString("fr-FR")}
            <span style={{ fontSize: 16, color: "#A09890", marginLeft: 6 }}>F CFA</span>
          </p>
          <p style={{ fontSize: 12, color: "#6B6560", marginTop: 6 }}>
            Tips reçus · {stats.totalTips.toLocaleString("fr-FR")} F + Abonnements · {stats.totalSubscribers} × 400 F
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Tips reçus", value: stats.totalTips.toLocaleString("fr-FR") + " F", icon: "💛" },
            { label: "Abonnés", value: stats.totalSubscribers, icon: "⭐" },
            { label: "Vidéos", value: stats.totalVideos, icon: "🎬" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl p-3 text-center"
              style={{ background: "#1A1714", border: "0.5px solid #2A2420" }}
            >
              <div style={{ fontSize: 20 }}>{stat.icon}</div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, marginTop: 4 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 10, color: "#6B6560", marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div
          className="flex rounded-xl overflow-hidden mb-4"
          style={{ background: "#1A1714", padding: 3, gap: 3 }}
        >
          {[
            { id: "overview", label: "Aperçu" },
            { id: "tips", label: "Tips" },
            { id: "videos", label: "Vidéos" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-2 rounded-lg transition-all"
              style={{
                background: activeTab === tab.id ? "#FF6B2B" : "transparent",
                color: activeTab === tab.id ? "#fff" : "#6B6560",
                fontSize: 12, fontWeight: 700,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-3">
            <div
              className="rounded-xl p-4"
              style={{ background: "#1A1714", border: "0.5px solid #2A2420" }}
            >
              <p style={{ fontSize: 13, fontWeight: 700, color: "#F5F0EB", marginBottom: 12 }}>
                📊 Résumé des revenus
              </p>
              {[
                { label: "Tips bruts", value: stats.totalTips.toLocaleString("fr-FR") + " F", note: "avant commission" },
                { label: "Commission rire.ci (15%)", value: "− " + Math.round(stats.totalTips * 0.15).toLocaleString("fr-FR") + " F", note: "" },
                { label: "Abonnements (80%)", value: "+ " + Math.round(stats.totalSubscribers * 500 * 0.80).toLocaleString("fr-FR") + " F", note: `${stats.totalSubscribers} abonnés × 400 F` },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between items-center py-2"
                  style={{ borderBottom: "0.5px solid #2A2420" }}
                >
                  <div>
                    <p style={{ fontSize: 13, color: "#A09890" }}>{row.label}</p>
                    {row.note && <p style={{ fontSize: 10, color: "#6B6560" }}>{row.note}</p>}
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#F5F0EB" }}>{row.value}</p>
                </div>
              ))}
              <div className="flex justify-between items-center pt-3">
                <p style={{ fontSize: 14, fontWeight: 700, color: "#FFD600" }}>Total net</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#FFD600" }}>
                  {stats.pendingBalance.toLocaleString("fr-FR")} F
                </p>
              </div>
            </div>

            {/* Quick links */}
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: "0.5px solid #2A2420" }}
            >
              {[
                { label: "Voir mon profil public", action: () => router.push(`/comedien/${comedian.slug}`), icon: "👤" },
                { label: "Ajouter une vidéo", action: () => router.push("/upload-video"), icon: "🎬" },
              ].map((item, i) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="w-full flex items-center justify-between px-4 py-4"
                  style={{
                    background: "#1A1714",
                    borderBottom: i === 0 ? "0.5px solid #2A2420" : "none",
                    color: "#F5F0EB",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: 18 }}>{item.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</span>
                  </div>
                  <span style={{ color: "#FF6B2B", fontSize: 16 }}>→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tips tab */}
        {activeTab === "tips" && (
          <div>
            {recentTips.length === 0 ? (
              <div className="text-center py-16" style={{ color: "#6B6560" }}>
                <div style={{ fontSize: 40 }}>💛</div>
                <p style={{ marginTop: 8, fontSize: 14 }}>Pas encore de tips reçus.</p>
                <p style={{ fontSize: 12, marginTop: 4 }}>Partage ton profil pour en recevoir !</p>
              </div>
            ) : (
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: "0.5px solid #2A2420" }}
              >
                {recentTips.map((tip, i) => (
                  <div
                    key={tip.id}
                    className="flex items-center justify-between px-4 py-3"
                    style={{ background: "#1A1714", borderBottom: i < recentTips.length - 1 ? "0.5px solid #2A2420" : "none" }}
                  >
                    <div className="flex items-center gap-3">
                      <span style={{ fontSize: 20 }}>💛</span>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#F5F0EB" }}>
                          Fan anonyme
                        </p>
                        <p style={{ fontSize: 11, color: "#6B6560" }}>
                          {new Date(tip.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#FFD600" }}>
                        +{tip.amount.toLocaleString("fr-FR")} F
                      </p>
                      <p style={{ fontSize: 10, color: "#6B6560" }}>
                        net: {Math.round(tip.amount * 0.85).toLocaleString("fr-FR")} F
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Videos tab */}
        {activeTab === "videos" && (
          <div>
            <button
              onClick={() => router.push("/upload")}
              className="w-full py-3 rounded-xl mb-4 transition-all active:scale-95"
              style={{ background: "#FF6B2B", color: "#fff", fontSize: 14, fontWeight: 700 }}
            >
              + Ajouter une vidéo
            </button>

            {videos.length === 0 ? (
              <div className="text-center py-16" style={{ color: "#6B6560" }}>
                <div style={{ fontSize: 40 }}>🎬</div>
                <p style={{ marginTop: 8, fontSize: 14 }}>Aucune vidéo pour l'instant.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: "#1A1714", border: "0.5px solid #2A2420" }}
                  >
                    <div
                      style={{
                        width: 56, height: 56, borderRadius: 10, flexShrink: 0,
                        background: "#2A1F1A",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 20,
                      }}
                    >
                      🎬
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#F5F0EB", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {video.title}
                      </p>
                      <p style={{ fontSize: 11, color: "#6B6560", marginTop: 2 }}>
                        {new Date(video.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                        {" · "}
                        {video.is_locked ? "🔒 Exclusif" : "🌍 Public"}
                      </p>
                    </div>
                    <div style={{ fontSize: 12, color: "#A09890", flexShrink: 0 }}>
                      {(video.views || 0).toLocaleString("fr-FR")} vues
                    </div>
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