"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Modal from "@/components/admin/Modal";
import { createClient } from "@/lib/supabase/client";
import type { Folder, Site } from "@/lib/sites";

// 모든 쓰기는 browser client + RLS 로 수행된다. UI 숨김은 보조 수단일 뿐이고
// 실제 권한은 DB 의 is_admin() policy 가 판단한다.

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const RESERVED = ["home", "auth", "api", "login"];
const HTTP_RE = /^https?:\/\/\S+$/i;

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function Input({
  id,
  label,
  value,
  onChange,
  error,
  placeholder,
  autoFocus,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  autoFocus?: boolean;
  type?: string;
}) {
  return (
    <div className="auth-field">
      <label className="auth-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="auth-input"
        type={type}
        value={value}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        aria-invalid={error ? true : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="auth-error" role={error ? "alert" : undefined}>
        {error}
      </p>
    </div>
  );
}

export function FolderForm({
  folder,
  nextOrder,
  onClose,
  onSaved,
}: {
  folder?: Folder;
  nextOrder: number;
  onClose: () => void;
  onSaved: (slug: string) => void;
}) {
  const [name, setName] = useState(folder?.name ?? "");
  const [slug, setSlug] = useState(folder?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(folder));
  const [headline, setHeadline] = useState(folder?.headline ?? "");
  const [order, setOrder] = useState(String(folder?.sortOrder ?? nextOrder));
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");
  const [busy, setBusy] = useState(false);

  const errors = {
    name: name.trim() ? "" : "Folder name is required.",
    slug: !SLUG_RE.test(slug)
      ? "Use lowercase letters, numbers and hyphens."
      : RESERVED.includes(slug)
        ? "This slug is reserved."
        : "",
    order: /^-?\d+$/.test(order) ? "" : "Enter a whole number.",
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setSubmitted(true);
    setServerError("");
    if (Object.values(errors).some(Boolean)) return;
    setBusy(true);
    const row = {
      name: name.trim(),
      slug,
      headline: headline.trim() || null,
      sort_order: Number(order),
    };
    const supabase = createClient();
    const { error } = folder
      ? await supabase.from("folders").update(row).eq("id", folder.id)
      : await supabase.from("folders").insert(row);
    setBusy(false);
    if (error) {
      setServerError(error.message);
      return;
    }
    onSaved(slug);
  }

  return (
    <Modal title={folder ? "EDIT FOLDER" : "NEW FOLDER"} onClose={onClose}>
      <form className="auth-panel" onSubmit={onSubmit} noValidate>
        <Input
          id="folder-name"
          label="FOLDER NAME"
          value={name}
          placeholder="MARKETING"
          autoFocus
          error={submitted ? errors.name : ""}
          onChange={(v) => {
            setName(v);
            if (!slugTouched) setSlug(slugify(v));
          }}
        />
        <Input
          id="folder-slug"
          label="SLUG"
          value={slug}
          placeholder="marketing"
          error={submitted ? errors.slug : ""}
          onChange={(v) => {
            setSlugTouched(true);
            setSlug(v.toLowerCase());
          }}
        />
        <Input
          id="folder-headline"
          label="HEADLINE (OPTIONAL)"
          value={headline}
          onChange={setHeadline}
        />
        {folder && (
          <Input
            id="folder-order"
            label="SORT ORDER"
            value={order}
            error={submitted ? errors.order : ""}
            onChange={setOrder}
          />
        )}
        <p className="auth-error" role="alert">
          {serverError}
        </p>
        <button type="submit" className="auth-submit" disabled={busy}>
          SAVE
        </button>
        <div className="auth-row is-center">
          <button type="button" className="auth-action" onClick={onClose}>
            CANCEL
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function SiteForm({
  site,
  folders,
  currentFolderId,
  onClose,
  onSaved,
}: {
  site?: Site;
  folders: Folder[];
  currentFolderId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(site?.name ?? "");
  const [url, setUrl] = useState(site?.url ?? "");
  const [desc, setDesc] = useState(site?.desc ?? "");
  const [image, setImage] = useState(site?.image ?? "");
  const [tag, setTag] = useState(site?.tag ?? "");
  const [folderId, setFolderId] = useState(site?.folderId ?? currentFolderId);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");
  const [busy, setBusy] = useState(false);

  const errors = {
    title: title.trim() ? "" : "Title is required.",
    url: HTTP_RE.test(url.trim()) ? "" : "Enter a valid http(s) URL.",
    image:
      !image.trim() || HTTP_RE.test(image.trim())
        ? ""
        : "Enter a valid http(s) URL.",
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setSubmitted(true);
    setServerError("");
    if (Object.values(errors).some(Boolean)) return;
    setBusy(true);
    const supabase = createClient();
    const row: Record<string, unknown> = {
      folder_id: folderId,
      title: title.trim(),
      url: url.trim(),
      description: desc.trim(),
      image_url: image.trim(),
      tag: tag.trim().toUpperCase(),
    };
    // 새 item 이거나 folder 가 바뀌면 대상 folder 의 마지막 순서로 넣는다.
    if (!site || site.folderId !== folderId) {
      const { data } = await supabase
        .from("sites")
        .select("sort_order")
        .eq("folder_id", folderId)
        .order("sort_order", { ascending: false })
        .limit(1);
      row.sort_order = (data?.[0]?.sort_order ?? 0) + 1;
    }
    const { error } = site
      ? await supabase.from("sites").update(row).eq("id", site.id)
      : await supabase.from("sites").insert(row);
    setBusy(false);
    if (error) {
      setServerError(error.message);
      return;
    }
    onSaved();
  }

  return (
    <Modal title={site ? "EDIT SITE" : "ADD SITE"} onClose={onClose}>
      <form className="auth-panel" onSubmit={onSubmit} noValidate>
        <Input
          id="site-title"
          label="TITLE"
          value={title}
          autoFocus
          error={submitted ? errors.title : ""}
          onChange={setTitle}
        />
        <Input
          id="site-url"
          label="URL"
          value={url}
          placeholder="https://"
          error={submitted ? errors.url : ""}
          onChange={setUrl}
        />
        <Input id="site-desc" label="DESCRIPTION" value={desc} onChange={setDesc} />
        <Input
          id="site-image"
          label="IMAGE URL"
          value={image}
          placeholder="https://"
          error={submitted ? errors.image : ""}
          onChange={setImage}
        />
        <Input id="site-tag" label="TAG" value={tag} onChange={setTag} />
        <div className="auth-field">
          <label className="auth-label" htmlFor="site-folder">
            FOLDER
          </label>
          <select
            id="site-folder"
            className="auth-input"
            value={folderId}
            onChange={(e) => setFolderId(e.target.value)}
          >
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
        <p className="auth-error" role="alert">
          {serverError}
        </p>
        <button type="submit" className="auth-submit" disabled={busy}>
          SAVE
        </button>
        <div className="auth-row is-center">
          <button type="button" className="auth-action" onClick={onClose}>
            CANCEL
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function ConfirmDelete({
  onClose,
  onConfirm,
  error,
  busy,
}: {
  onClose: () => void;
  onConfirm: () => void;
  error: string;
  busy: boolean;
}) {
  return (
    <Modal title="DELETE THIS SITE?" onClose={onClose}>
      <div className="auth-panel">
        <p className="auth-error" role="alert">
          {error}
        </p>
        <div className="auth-row is-center">
          <button
            type="button"
            className="auth-action is-accent"
            disabled={busy}
            onClick={onConfirm}
          >
            DELETE
          </button>
          <button type="button" className="auth-action" onClick={onClose}>
            CANCEL
          </button>
        </div>
      </div>
    </Modal>
  );
}
