"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { DragEvent } from "react";
import { useEditMode } from "@/components/admin/EditMode";
import { FolderForm } from "@/components/admin/Forms";
import SearchBox from "@/components/navigation/SearchBox";
import { createClient } from "@/lib/supabase/client";
import type { Folder, Site } from "@/lib/sites";

type Props = {
  folders: Folder[];
  sites: Site[];
  isAdmin: boolean;
  signedIn: boolean;
  email: string;
};

export default function TopNavigation({
  folders,
  sites,
  isAdmin,
  signedIn,
  email,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { editMode, setEditMode } = useEditMode();
  const [accountOpen, setAccountOpen] = useState(false);
  const [newFolder, setNewFolder] = useState(false);

  // folder 드래그 순서 (서버 데이터가 바뀌면 key 로 remount 되어 초기화된다)
  const [order, setOrder] = useState(folders);
  const orderRef = useRef(order);
  const startIds = useRef<string[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const editing = isAdmin && editMode;

  async function onLogout() {
    const { error } = await createClient().auth.signOut({ scope: "local" });
    if (error) return;
    router.replace("/");
    router.refresh();
  }

  function onDragStart(e: DragEvent, id: string) {
    startIds.current = orderRef.current.map((f) => f.id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
    setDragId(id);
  }

  function onDragOver(e: DragEvent, overId: string) {
    if (!dragId) return;
    e.preventDefault();
    if (dragId === overId) return;
    const cur = orderRef.current;
    const from = cur.findIndex((f) => f.id === dragId);
    const to = cur.findIndex((f) => f.id === overId);
    if (from < 0 || to < 0 || from === to) return;
    const next = cur.slice();
    next.splice(to, 0, next.splice(from, 1)[0]);
    orderRef.current = next;
    setOrder(next);
  }

  async function onDragEnd() {
    setDragId(null);
    const current = orderRef.current;
    const before = startIds.current;
    if (current.every((f, i) => f.id === before[i])) return;
    const supabase = createClient();
    const results = await Promise.all(
      current.map((f, i) =>
        supabase.from("folders").update({ sort_order: i + 1 }).eq("id", f.id),
      ),
    );
    if (results.some((r) => r.error)) {
      const byId = new Map(current.map((f) => [f.id, f]));
      const back = before.map((id) => byId.get(id)!);
      orderRef.current = back;
      setOrder(back);
    }
    router.refresh();
  }

  return (
    <header className="nav">
      <div className="wrap nav-inner">
        <nav className="nav-links" aria-label="Main">
          <Link
            href="/home"
            className="nav-link"
            aria-current={pathname === "/home" ? "page" : undefined}
          >
            HOME
          </Link>
          {order.map((f) =>
            editing ? (
              <span
                key={f.id}
                className={`nav-link is-edit${dragId === f.id ? " is-dragging" : ""}`}
                draggable
                onDragStart={(e) => onDragStart(e, f.id)}
                onDragOver={(e) => onDragOver(e, f.id)}
                onDrop={(e) => e.preventDefault()}
                onDragEnd={onDragEnd}
              >
                {f.name}
              </span>
            ) : (
              <Link
                key={f.id}
                href={`/${f.slug}`}
                className="nav-link"
                aria-current={pathname === `/${f.slug}` ? "page" : undefined}
              >
                {f.name}
              </Link>
            ),
          )}
        </nav>

        <div className="nav-search">
          {signedIn && (
            <span className="nav-account">
              <button
                type="button"
                className="nav-user is-button"
                aria-expanded={accountOpen}
                onClick={() => setAccountOpen((v) => !v)}
              >
                ACCOUNT
              </button>
              {accountOpen && (
                <span className="nav-account-panel">
                  <span>{email}</span>
                  <span>{isAdmin ? "ADMIN" : "MEMBER"}</span>
                </span>
              )}
            </span>
          )}
          {isAdmin && (
            <>
              <button
                type="button"
                className="nav-user is-button"
                aria-pressed={editMode}
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? "DONE" : "EDIT"}
              </button>
              <button
                type="button"
                className="nav-user is-button"
                onClick={() => setNewFolder(true)}
              >
                NEW FOLDER
              </button>
            </>
          )}
          {signedIn && (
            <button
              type="button"
              className="nav-user is-button"
              onClick={onLogout}
            >
              LOGOUT
            </button>
          )}
          <span className="nav-search-label">SEARCH</span>
          <SearchBox folders={folders} sites={sites} />
        </div>
      </div>

      {newFolder && (
        <FolderForm
          nextOrder={folders.reduce((m, f) => Math.max(m, f.sortOrder), 0) + 1}
          onClose={() => setNewFolder(false)}
          onSaved={() => {
            setNewFolder(false);
            router.refresh();
          }}
        />
      )}
    </header>
  );
}
