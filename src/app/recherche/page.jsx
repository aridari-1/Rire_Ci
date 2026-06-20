"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const TAGS = ["Sketchs", "Maquis", "Nouchi", "Fonctionnaires", "Famille", "Politique", "Musique"];

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
    let qb = supabase.from("comedians").select("*");
    if (q.trim()) qb = qb.or(`name.ilike.%${q}%,tagline.ilike.%${q}%,bio.ilike.%${q}%`);
    if (tag) qb = qb.contains("tags", [tag]);
    const { data } = await qb.order("created_at", { ascending: false });
    setResults(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (query.trim().length >= 2) {
      const t = setTimeout(() => search(query, selectedTag), 350);
      return () => clearTimeout(t);
    }
    if (!query.trim() && !selectedTag) { setResults([]); setSearched(false); }
  }, [query, selectedTag, search]);

  useEffect(() => {
    if (selectedTag) search(query, selectedTag);
  }, [selectedTag]);

  function highlight(text) {
    if (!query.trim() || !text) return text;
    const regex = new RegExp(`(${query.trim()})`, "gi");
    return text.split(regex).map((part, i) =>
      regex.test(part)
        ? <mark key={i} style={{ background: "rgba(255,69,0,0.2)", color: "var(--accent)", borderRadius: 3, padding: "0 2px" }}>{part}</mark>
        : part
    );
  }

  return (
    <div style={{ minHeight: "100vh" }}>

      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 40,
        padding: "14px 16px",
        background: "rgba(17,17,20,0.95)", backdropFilter: "blur(12px)",
        borderBottom: "0.5px solid var(--border)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bg-2)", borderRadius: 10, padding: "10px 14px", border: "0.5px solid var(--border)" }}>
          <i className="ti ti-search" style={{ fontSize: 16, color: "var(--text-3)", flexShrink: 0 }} aria-hidden="true" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un comédien..."
            autoFocus
            style={{ flex: 1, background: "none", border: "none", padding: 0, fontSize: 15, color: "var(--text-1)", outline: "none" }}
          />
          {query && (
            <button onClick={() => { setQuery(""); setResults([]); setSearched(false); }} style={{ background: "none", border: "none", color: "var(--text-3)", fontSize: 18, padding: 0, lineHeight: 1 }}>
              <i className="ti ti-x" style={{ fontSize: 16 }} aria-hidden="true" />
            </button>
          )}
        </div>
      </nav>

      <div style={{ padding: "16px 16px 24px" }}>

        {/* Tags */}
        <p style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
          Parcourir par thème
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
          {TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                if (selectedTag === tag) { setSelectedTag(null); setResults([]); setSearched(false); }
                else setSelectedTag(tag);
              }}
              style={{
                padding: "7px 14px", borderRadius: 20, fontSize: 13, fontWeight: 500, border: "none",
                background: selectedTag === tag ? "var(--accent)" : "var(--bg-2)",
                color: selectedTag === tag ? "#fff" : "var(--text-2)",
                outline: selectedTag !== tag ? "0.5px solid var(--border)" : "none",
              }}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-3)" }}>
            <i className="ti ti-loader" style={{ fontSize: 28 }} aria-hidden="true" />
            <p style={{ marginTop: 8, fontSize: 14 }}>Recherche...</p>
          </div>
        )}

        {/* No results */}
        {!loading && searched && results.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <i className="ti ti-mood-sad" style={{ fontSize: 36, color: "var(--text-3)" }} aria-hidden="true" />
            <p style={{ fontSize: 15, fontWeight: 600, marginTop: 10 }}>Aucun résultat</p>
            <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 6 }}>Essaie un autre nom ou thème.</p>
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <div>
            <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 12 }}>
              {results.length} comédien{results.length > 1 ? "s" : ""} trouvé{results.length > 1 ? "s" : ""}
              {selectedTag ? ` · "${selectedTag}"` : ""}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {results.map((c) => {
                const initials = c.name.split(" ").map((n) => n[0]).join("").toUpperCase();
                return (
                  <div
                    key={c.id}
                    onClick={() => router.push(`/comedien/${c.slug}`)}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px", borderRadius: 12, background: "var(--bg-2)", border: "0.5px solid var(--border)", cursor: "pointer" }}
                  >
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: c.cover_color || "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                      {c.avatar_url ? <img src={c.avatar_url} alt={c.name} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <p style={{ fontSize: 15, fontWeight: 600 }}>{highlight(c.name)}</p>
                        {c.is_verified && <i className="ti ti-rosette-discount-check" style={{ fontSize: 15, color: "var(--accent)", flexShrink: 0 }} aria-hidden="true" />}
                      </div>
                      {c.tagline && <p style={{ fontSize: 12, color: "var(--accent)", marginTop: 2, fontWeight: 500 }}>{highlight(c.tagline)}</p>}
                      {c.tags?.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
                          {c.tags.map((tag) => (
                            <span key={tag} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: tag === selectedTag ? "rgba(255,69,0,0.15)" : "var(--bg-3)", color: tag === selectedTag ? "var(--accent)" : "var(--text-3)", border: `0.5px solid ${tag === selectedTag ? "rgba(255,69,0,0.3)" : "var(--border)"}` }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <i className="ti ti-chevron-right" style={{ fontSize: 16, color: "var(--text-3)", flexShrink: 0 }} aria-hidden="true" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!searched && !loading && (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <i className="ti ti-masks-theater" style={{ fontSize: 40, color: "var(--text-3)" }} aria-hidden="true" />
            <p style={{ fontSize: 15, fontWeight: 600, marginTop: 12 }}>Trouve ton comédien préféré</p>
            <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 6, lineHeight: 1.6 }}>
              Tape un nom ou choisis un thème<br />pour découvrir des talents.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}