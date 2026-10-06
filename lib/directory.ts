import { createClient } from "@/lib/supabase/server";
import type { Folder, Site } from "@/lib/sites";

export type DirectoryContext = {
  signedIn: boolean;
  email: string;
  isAdmin: boolean;
  folders: Folder[];
  sites: Site[];
};

// 서버에서 session / role / folders / sites 를 한 번에 읽는다. 권한은 RLS 가 최종 판단한다.
export async function getDirectoryContext(): Promise<DirectoryContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { signedIn: false, email: "", isAdmin: false, folders: [], sites: [] };
  }

  const [profile, folders, sites] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
    supabase.from("folders").select("*").order("sort_order"),
    supabase.from("sites").select("*").order("sort_order"),
  ]);

  return {
    signedIn: true,
    email: user.email ?? "",
    isAdmin: profile.data?.role === "admin",
    folders: (folders.data ?? []).map((f) => ({
      id: f.id,
      name: f.name,
      slug: f.slug,
      headline: f.headline,
      sortOrder: f.sort_order,
    })),
    sites: (sites.data ?? []).map((s) => ({
      id: s.id,
      folderId: s.folder_id,
      name: s.title,
      url: s.url,
      desc: s.description,
      image: s.image_url,
      tag: s.tag,
      sortOrder: s.sort_order,
    })),
  };
}
