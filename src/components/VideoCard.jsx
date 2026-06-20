"use client";

import { useState } from "react";

export default function VideoCard({ video, coverColor, isSubscribed, onSubscribe }) {
  const [playing, setPlaying] = useState(false);
  const canWatch = !video.is_locked || isSubscribed;

  const handleClick = () => {
    if (!canWatch) {
      onSubscribe();
      return;
    }
    setPlaying(true);
  };

  const bunnyUrl = `https://iframe.mediadelivery.net/embed/${process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID}/${video.bunny_video_id}?autoplay=true&responsive=true`;

  const thumbBg = ["#2A1F1A","#1A1F2A","#1A2A1F","#2A2A1A","#2A1A2A","#1A2A2A"][
    Math.abs(video.id?.charCodeAt(0) || 0) % 6
  ];

  return (
    <div
      className="rounded-xl overflow-hidden cursor-pointer active:scale-95 transition-transform"
      style={{ background: "#1A1714", border: "0.5px solid #2A2420" }}
    >
      {playing ? (
        /* ── Bunny player ── */
        <div style={{ position: "relative", paddingTop: "56.25%" }}>
          <iframe
            src={bunnyUrl}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          <button
            onClick={() => setPlaying(false)}
            style={{
              position: "absolute", top: 6, right: 6,
              background: "rgba(14,12,10,0.8)", border: "none",
              color: "#F5F0EB", borderRadius: 6, padding: "2px 8px",
              fontSize: 11, cursor: "pointer", zIndex: 10,
            }}
          >
            ✕
          </button>
        </div>
      ) : (
        /* ── Thumbnail ── */
        <div
          onClick={handleClick}
          className="relative w-full flex items-center justify-center"
          style={{ height: 100, background: thumbBg }}
        >
          {video.is_locked && !isSubscribed ? (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ background: "rgba(14,12,10,0.7)", backdropFilter: "blur(4px)" }}
            >
              <span style={{ fontSize: 22 }}>🔒</span>
              <span style={{ fontSize: 11, color: "#FFD600", fontWeight: 600, marginTop: 4 }}>
                Abonnés seulement
              </span>
            </div>
          ) : (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,107,43,0.85)" }}
            >
              <span style={{ fontSize: 16, marginLeft: 3 }}>▶</span>
            </div>
          )}
          {video.duration && (
            <span
              className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded"
              style={{ background: "rgba(14,12,10,0.85)", color: "#F5F0EB", fontSize: 10, fontWeight: 500 }}
            >
              {video.duration}
            </span>
          )}
        </div>
      )}

      {/* Info */}
      <div className="p-2.5" onClick={!playing ? handleClick : undefined}>
        <p
          style={{
            fontSize: 12, color: "#F5F0EB", fontWeight: 600, lineHeight: 1.4,
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}
        >
          {video.title}
        </p>
        <div className="flex items-center justify-between mt-1.5">
          <span style={{ fontSize: 10, color: "#6B6560" }}>
            {video.is_locked ? "🔒 Exclusif" : "Gratuit"}
          </span>
        </div>
      </div>
    </div>
  );
}