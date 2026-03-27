"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { searchDiary, SearchResult } from "@/lib/storage";

function SearchResults() {
  const params = useSearchParams();
  const router = useRouter();
  const initialQ = params.get("q") ?? "";
  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialQ.trim()) {
      setResults(searchDiary(initialQ));
      setSearched(true);
    }
  }, [initialQ]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  function formatDate(dateStr: string) {
    const [y, m, d] = dateStr.split("-");
    return `${d}.${m}.${y}`;
  }

  return (
    <div className="page-inner">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
        <Link href="/" style={{ color: "var(--accent)", textDecoration: "none", fontSize: 22 }}>←</Link>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--accent)" }}>Пошук</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, marginBottom: "1.5rem" }}>
        <input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Пошук по нотатках, їжі, розкладі, задачах..."
          style={{
            flex: 1,
            background: "var(--surface)",
            border: "1px solid var(--accent)",
            borderRadius: 8,
            padding: "10px 14px",
            color: "var(--text)",
            fontSize: 16,
            outline: "none",
          }}
        />
        <button
          type="submit"
          style={{
            background: "var(--accent)",
            color: "#000",
            border: "none",
            borderRadius: 8,
            padding: "10px 20px",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 15,
          }}
        >
          Знайти
        </button>
      </form>

      {searched && (
        <div style={{ marginBottom: "0.75rem", color: "color-mix(in srgb, var(--text) 60%, transparent)", fontSize: 14 }}>
          {results.length === 0
            ? `Нічого не знайдено за запитом «${initialQ}»`
            : `Знайдено: ${results.length} ${results.length === 1 ? "день" : results.length < 5 ? "дні" : "днів"} за запитом «${initialQ}»`}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {results.map(r => (
          <Link
            key={r.date}
            href={`/day/${r.date}`}
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
                borderRadius: 10,
                padding: "12px 16px",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "color-mix(in srgb, var(--accent) 30%, transparent)")}
            >
              <div style={{ fontWeight: 700, color: "var(--accent)", marginBottom: 6, fontSize: 15 }}>
                {formatDate(r.date)}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {r.snippets.slice(0, 4).map((s, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: 13,
                      color: "var(--text)",
                      opacity: 0.85,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s}
                  </div>
                ))}
                {r.snippets.length > 4 && (
                  <div style={{ fontSize: 12, color: "color-mix(in srgb, var(--text) 55%, transparent)" }}>
                    +{r.snippets.length - 4} ще…
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {!searched && (
        <div style={{ textAlign: "center", color: "color-mix(in srgb, var(--text) 45%, transparent)", marginTop: 60, fontSize: 15 }}>
          Введіть запит щоб знайти записи
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="page-inner" style={{ color: "var(--text)" }}>Завантаження…</div>}>
      <SearchResults />
    </Suspense>
  );
}
