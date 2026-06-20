"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const POPULAR_TAGS = ["Sketchs", "Maquis", "Nouchi", "Fonctionnaires", "Famille", "Politique", "Musique"];

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = useCallback(async (q, tag) => {
    setLoading(true);
    setSearched(true);

    let queryBuilder = supabase
      .from("comedians")
      .select("*");

    if (q.trim()) {
      queryBuilder = queryBuilder.or(
        `name.ilike.%${q}%,tagline.ilike.%${q}%,bio.ilike.%${q}%`
      );
    }

    if (tag) {
      queryBuilder = queryBuilder.contains("tags", [tag]);
    }

    const { data } = await queryBuilder.order("created_at", { ascending: false });
    setResults(data || []);
    setLoading(false);
  }, []);

  // Search as user types
  useEffect(() => {
    if (query.trim().length >= 2) {
      const timeout = setTimeout(() => search(query, selectedTag), 350);
      return () => clearTimeout(timeout);
    }
    if (query.trim().length === 0 && !selectedTag) {
      setResults([]);
      setSearched(false);
    }
  }, [query, selectedTag, search]);

  // Search when tag is selected
  useEffect(() => {
    if (selectedTag) {
      search(query, selectedTag);
    }
  }, [selectedTag]);

  function handleTagClick(tag) {
    if (selectedTag === tag) {
      setSelectedTag(null);
      setResults([]);
      setSearched(false);
    } else {
      setSelectedTag(tag);
    }
  }

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
        <div style={{ width: 22 }} />
      </nav>

      <div className="px-4 pt-6 pb-24">

        {/* Search input */}
        <div style={{ position: "relative", marginBottom: 20 }}>
          <span
            style={{
              position: "absolute", left: 14, top: "50%",
              transform: "translateY(-50%)",
              fontSize: 16, color: "#6B6560",
            }}
          >
            🔍
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un comédien..."
            autoFocus
            style={{
              width: "100%", padding: "14px 14px 14px 42px",
              borderRadius: 14, background: "#1A1714",
              border: `0.5px solid ${query ? "#FF6B2B" : "#2A2420"}`,
              color: "#F5F0EB", fontSize: 15, outline: "none",
            }}
          />
          {query.length > 0 && (
            <button
              onClick={() => { setQuery(""); setResults([]); setSearched(false); }}
              style={{
                position: "absolute", right: 14, top: "50%",
                transform: "translateY(-50%)",
                color: "#6B6560", fontSize: 18, background: "none", border: "none", cursor: "pointer",
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Popular tags */}
        <div className="mb-6">
          <p style={{ fontSize: 12, color: "#6B6560", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
            Parcourir par thème
          </p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="px-4 py-2 rounded-full transition-all active:scale-95"
                style={{
                  background: selectedTag === tag ? "#FF6B2B" : "#1A1714",
                  color: selectedTag === tag ? "#fff" : "#A09890",
                  border: `0.5px solid ${selectedTag === tag ? "#FF6B2B" : "#2A2420"}`,
                  fontSize: 13, fontWeight: 600,
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading && (
          <div className="text-center py-12" style={{ color: "#6B6560" }}>
            <p style={{ fontSize: 14 }}>Recherche en cours...</p>
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="text-center py-16">
            <div style={{ fontSize: 40 }}>😕</div>
            <p style={{ fontSize: 15, fontWeight: 600, marginTop: 10 }}>Aucun résultat</p>
            <p style={{ fontSize: 13, color: "#6B6560", marginTop: 6 }}>
              Essaie un autre nom ou un autre thème.
            </p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div>
            <p style={{ fontSize: 12, color: "#6B6560", marginBottom: 12 }}>
              {results.length} comédien{results.length > 1 ? "s" : ""} trouvé{results.length > 1 ? "s" : ""}
              {selectedTag ? ` pour "${selectedTag}"` : ""}
            </p>
            <div className="flex flex-col gap-3">
              {results.map((comedian) => (
                <ComedianResult
                  key={comedian.id}
                  comedian={comedian}
                  query={query}
                  selectedTag={selectedTag}
                  onClick={() => router.push(`/comedien/${comedian.slug}`)}
                />
              ))}
            </div>
          </div>
        )}

        {!searched && (
          <div className="text-center py-16">
            <div style={{ fontSize: 48 }}>🎭</div>
            <p style={{ fontSize: 15, fontWeight: 600, marginTop: 12, color: "#F5F0EB" }}>
              Trouve ton comédien préféré
            </p>
            <p style={{ fontSize: 13, color: "#6B6560", marginTop: 6, lineHeight: 1.6 }}>
              Tape un nom ou choisis un thème<br />pour découvrir des talents.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Result card ───────────────────────────────────────────────────────────────
function ComedianResult({ comedian, query, selectedTag, onClick }) {
  const initials = comedian.name.split(" ").map((n) => n[0]).join("").toUpperCase();

  // Highlight matching text
  function highlight(text) {
    if (!query.trim() || !text) return text;
    const regex = new RegExp(`(${query.trim()})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part)
        ? <mark key={i} style={{ background: "#FF6B2B33", color: "#FF6B2B", borderRadius: 3, padding: "0 2px" }}>{part}</mark>
        : part
    );
  }

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 p-4 rounded-xl cursor-pointer active:scale-95 transition-transform"
      style={{ background: "#1A1714", border: "0.5px solid #2A2420" }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
          background: comedian.cover_color,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: "#fff",
        }}
      >
        {comedian.avatar_url
          ? <img src={comedian.avatar_url} alt={comedian.name} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
          : initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p style={{ fontSize: 15, fontWeight: 700, color: "#F5F0EB" }}>
            {highlight(comedian.name)}
          </p>
          {comedian.is_verified && (
            <span style={{ fontSize: 10, color: "#FF6B2B", fontWeight: 700 }}>✓</span>
          )}
        </div>
        <p style={{ fontSize: 12, color: "#FFD600", fontStyle: "italic", marginTop: 1 }}>
          {highlight(comedian.tagline)}
        </p>
        {comedian.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {comedian.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 10, padding: "2px 8px", borderRadius: 999,
                  background: tag === selectedTag ? "#FF6B2B22" : "#0E0C0A",
                  color: tag === selectedTag ? "#FF6B2B" : "#6B6560",
                  border: `0.5px solid ${tag === selectedTag ? "#FF6B2B44" : "#2A2420"}`,
                  fontWeight: tag === selectedTag ? 700 : 400,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <span style={{ color: "#FF6B2B", fontSize: 16, flexShrink: 0 }}>→</span>
    </div>
  );
}