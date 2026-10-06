"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { DragEvent } from "react";
import { useRouter } from "next/navigation";
import { useEditMode } from "@/components/admin/EditMode";
import { ConfirmDelete, FolderForm, SiteForm } from "@/components/admin/Forms";
import { createClient } from "@/lib/supabase/client";
import type { Folder, Site } from "@/lib/sites";

type Props = {
  folder: Folder;
  folders: Folder[];
  initialSites: Site[];
  isAdmin: boolean;
  focusId?: string;
  focusKey?: string;
};

const ICON = {
  width: 14,
  height: 14,
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.3,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

type Dialog =
  | { kind: "add" }
  | { kind: "edit"; site: Site }
  | { kind: "delete"; site: Site }
  | { kind: "folder" }
  | null;

export default function DirectoryGrid({
  folder,
  folders,
  initialSites,
  isAdmin,
  focusId,
  focusKey,
}: Props) {
  const router = useRouter();
  const { editMode } = useEditMode();
  const editing = isAdmin && editMode;

  const [items, setItems] = useState(initialSites);
  const [dragId, setDragId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [hit, setHit] = useState<string | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const itemsRef = useRef(items);
  const startOrder = useRef<string[]>([]);
  const nodes = useRef(new Map<string, HTMLLIElement>());
  const rects = useRef(new Map<string, DOMRect>());
  const noticeTimer = useRef<number | undefined>(undefined);

  // 순서가 바뀌면 이전 위치에서 새 위치로 부드럽게 이동시킨다 (FLIP).
  useLayoutEffect(() => {
    itemsRef.current = items;
    nodes.current.forEach((el, id) => {
      const now = el.getBoundingClientRect();
      const old = rects.current.get(id);
      if (old && (old.left !== now.left || old.top !== now.top)) {
        el.style.transition = "none";
        el.style.transform = `translate(${old.left - now.left}px, ${old.top - now.top}px)`;
        requestAnimationFrame(() => {
          el.style.transition = "transform 180ms ease";
          el.style.transform = "";
        });
      }
      rects.current.set(id, now);
    });
  }, [items]);

  // 검색 결과로 들어온 경우 해당 카드로 scroll 하고 잠깐 강조한다.
  useEffect(() => {
    if (!focusId) return;
    const el = nodes.current.get(focusId);
    if (!el) return;
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    setHit(focusId);
    const t = window.setTimeout(() => setHit(null), 1200);
    return () => window.clearTimeout(t);
  }, [focusId, focusKey]);

  function flash(message: string) {
    window.clearTimeout(noticeTimer.current);
    setNotice(message);
    noticeTimer.current = window.setTimeout(() => setNotice(""), 2000);
  }

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      flash("COPIED");
    } catch {
      flash("COPY FAILED");
    }
  }

  async function share(site: Site) {
    if (navigator.share) {
      try {
        await navigator.share({ title: site.name, url: site.url });
      } catch {
        // 사용자가 공유를 취소한 경우
      }
      return;
    }
    await copy(site.url);
  }

  function onDragStart(e: DragEvent<HTMLLIElement>, id: string) {
    startOrder.current = itemsRef.current.map((s) => s.id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
    setDragId(id);
  }

  function onDragOver(e: DragEvent<HTMLLIElement>, overId: string) {
    if (!dragId) return;
    e.preventDefault();
    if (dragId === overId) return;
    setItems((cur) => {
      const from = cur.findIndex((s) => s.id === dragId);
      const to = cur.findIndex((s) => s.id === overId);
      if (from < 0 || to < 0 || from === to) return cur;
      const next = cur.slice();
      next.splice(to, 0, next.splice(from, 1)[0]);
      return next;
    });
  }

  async function onDragEnd() {
    setDragId(null);
    const current = itemsRef.current;
    const before = startOrder.current;
    if (current.every((s, i) => s.id === before[i])) return;

    const supabase = createClient();
    const results = await Promise.all(
      current.map((s, i) =>
        supabase.from("sites").update({ sort_order: i + 1 }).eq("id", s.id),
      ),
    );
    if (results.some((r) => r.error)) {
      // 저장 실패 시 원래 순서로 되돌린다.
      const byId = new Map(current.map((s) => [s.id, s]));
      setItems(before.map((id) => byId.get(id)!));
      flash("SAVE FAILED");
      return;
    }
    flash("SAVED");
    router.refresh();
  }

  async function confirmDelete(site: Site) {
    setDeleting(true);
    setDeleteError("");
    const { error } = await createClient().from("sites").delete().eq("id", site.id);
    setDeleting(false);
    if (error) {
      setDeleteError(error.message);
      return;
    }
    setDialog(null);
    router.refresh();
  }

  const lastOrder = folders.reduce((m, f) => Math.max(m, f.sortOrder), 0);

  return (
    <>
      <div className="wrap cat-tools">
        {editing && (
          <button
            type="button"
            className="cat-edit"
            onClick={() => setDialog({ kind: "folder" })}
          >
            EDIT FOLDER
          </button>
        )}
        <span className="cat-notice" role="status">
          {notice}
        </span>
      </div>

      <ul className="card-grid">
        {items.map((s) => {
          const body = (
            <>
              <span className="card-media" aria-hidden="true">
                {s.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.image} alt="" />
                ) : (
                  <span className="card-initial">{s.name.charAt(0)}</span>
                )}
              </span>
              <span className="card-text">
                <span className="card-name">{s.name}</span>
                <span className="card-tag">{s.tag}</span>
              </span>
            </>
          );
          return (
            <li
              key={s.id}
              ref={(el) => {
                if (el) nodes.current.set(s.id, el);
                else nodes.current.delete(s.id);
              }}
              className={`card${editing ? " is-edit" : ""}${dragId === s.id ? " is-dragging" : ""}${hit === s.id ? " is-hit" : ""}`}
              title={s.desc}
              draggable={editing}
              onDragStart={editing ? (e) => onDragStart(e, s.id) : undefined}
              onDragOver={editing ? (e) => onDragOver(e, s.id) : undefined}
              onDrop={editing ? (e) => e.preventDefault() : undefined}
              onDragEnd={editing ? onDragEnd : undefined}
            >
              {editing ? (
                <div className="card-link">{body}</div>
              ) : (
                <a
                  className="card-link"
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {body}
                </a>
              )}
              <div className="card-actions">
                <button
                  type="button"
                  aria-label={`Copy link: ${s.name}`}
                  title="COPY"
                  draggable={false}
                  onClick={() => copy(s.url)}
                >
                  <svg {...ICON}>
                    <rect x="5.5" y="5.5" width="8" height="8" rx="1.2" />
                    <path d="M10.5 5.5V3.7a1.2 1.2 0 0 0-1.2-1.2H3.7a1.2 1.2 0 0 0-1.2 1.2v5.6a1.2 1.2 0 0 0 1.2 1.2h1.8" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label={`Share: ${s.name}`}
                  title="SHARE"
                  draggable={false}
                  onClick={() => share(s)}
                >
                  <svg {...ICON}>
                    <path d="M8 10V2.5M5.2 5.2L8 2.5l2.8 2.7" />
                    <path d="M3.5 8.5v4a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-4" />
                  </svg>
                </button>
                {editing && (
                  <>
                    <button
                      type="button"
                      aria-label={`Edit: ${s.name}`}
                      title="EDIT"
                      draggable={false}
                      onClick={() => setDialog({ kind: "edit", site: s })}
                    >
                      <svg {...ICON}>
                        <path d="M2.5 13.5l.7-3L10.8 3a1.4 1.4 0 0 1 2 2l-7.6 7.6-2.7.9z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete: ${s.name}`}
                      title="DELETE"
                      draggable={false}
                      onClick={() => {
                        setDeleteError("");
                        setDialog({ kind: "delete", site: s });
                      }}
                    >
                      <svg {...ICON}>
                        <path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}

        {editing && (
          <li className="card card-add">
            <button
              type="button"
              className="card-link card-add-btn"
              onClick={() => setDialog({ kind: "add" })}
            >
              <span className="card-add-plus" aria-hidden="true">
                +
              </span>
              <span className="card-add-label">ADD SITE</span>
            </button>
          </li>
        )}
      </ul>

      {dialog?.kind === "add" && (
        <SiteForm
          folders={folders}
          currentFolderId={folder.id}
          onClose={() => setDialog(null)}
          onSaved={() => {
            setDialog(null);
            router.refresh();
          }}
        />
      )}
      {dialog?.kind === "edit" && (
        <SiteForm
          site={dialog.site}
          folders={folders}
          currentFolderId={folder.id}
          onClose={() => setDialog(null)}
          onSaved={() => {
            setDialog(null);
            router.refresh();
          }}
        />
      )}
      {dialog?.kind === "delete" && (
        <ConfirmDelete
          error={deleteError}
          busy={deleting}
          onClose={() => setDialog(null)}
          onConfirm={() => confirmDelete(dialog.site)}
        />
      )}
      {dialog?.kind === "folder" && (
        <FolderForm
          folder={folder}
          nextOrder={lastOrder + 1}
          onClose={() => setDialog(null)}
          onSaved={(slug) => {
            setDialog(null);
            if (slug !== folder.slug) router.replace(`/${slug}`);
            else router.refresh();
          }}
        />
      )}
    </>
  );
}
