"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { searchSites } from "@/lib/sites";
import type { Folder, SearchHit, Site } from "@/lib/sites";

const MAX_RESULTS = 8;

export default function SearchBox({
  folders,
  sites,
}: {
  folders: Folder[];
  sites: Site[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  // 카드와 같은 DB 데이터(서버에서 받아 둔 folders / sites)를 client 에서 바로 필터링한다.
  const results = useMemo(
    () => searchSites(folders, sites, query).slice(0, MAX_RESULTS),
    [folders, sites, query],
  );
  const showPanel = open && query.trim() !== "";

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  function choose(hit: SearchHit) {
    setOpen(false);
    setQuery("");
    router.push(
      `/${hit.folder.slug}?focus=${hit.site.id}&t=${Date.now()}`,
    );
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!showPanel || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(results[active]);
    }
  }

  return (
    <div className="nav-search-field" ref={rootRef}>
      <label className="nav-search-box">
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="7" cy="7" r="4.8" />
          <path d="M10.6 10.6L14 14" />
        </svg>
        <input
          type="text"
          placeholder="Search..."
          aria-label="Search"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls="search-results"
          aria-autocomplete="list"
          autoComplete="off"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
      </label>

      {showPanel && (
        <ul className="search-panel" id="search-results" role="listbox">
          {results.length === 0 ? (
            <li className="search-empty">NO RESULTS</li>
          ) : (
            results.map((hit, i) => (
              <li key={hit.site.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={i === active}
                  className="search-item"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(hit)}
                >
                  <span className="search-thumb" aria-hidden="true">
                    {hit.site.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={hit.site.image} alt="" />
                    ) : (
                      hit.site.name.charAt(0)
                    )}
                  </span>
                  <span className="search-text">
                    <span className="search-name">{hit.site.name}</span>
                    <span className="search-meta">
                      {hit.folder.name.toUpperCase()}
                      {hit.site.tag ? ` · ${hit.site.tag}` : ""}
                    </span>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
