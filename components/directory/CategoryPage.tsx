import { notFound } from "next/navigation";
import TopNavigation from "@/components/navigation/TopNavigation";
import DirectoryGrid from "@/components/directory/DirectoryGrid";
import { getDirectoryContext } from "@/lib/directory";

export default async function CategoryPage({
  slug,
  focusId,
  focusKey,
}: {
  slug: string;
  focusId?: string;
  focusKey?: string;
}) {
  const ctx = await getDirectoryContext();
  const folder = ctx.folders.find((f) => f.slug === slug);
  if (!folder) notFound();

  // folders / sites 는 DB 가 Source of Truth 이고 sort_order 순으로 이미 정렬되어 있다.
  const sites = ctx.sites.filter((s) => s.folderId === folder.id);
  const navKey = ctx.folders
    .map((f) => `${f.id}:${f.name}:${f.slug}:${f.sortOrder}`)
    .join("|");
  const gridKey = sites
    .map(
      (s) =>
        `${s.id}:${s.name}:${s.url}:${s.desc}:${s.image}:${s.tag}:${s.sortOrder}`,
    )
    .join("|");

  return (
    <div className="page">
      <TopNavigation
        key={navKey}
        folders={ctx.folders}
        sites={ctx.sites}
        isAdmin={ctx.isAdmin}
        signedIn={ctx.signedIn}
        email={ctx.email}
      />
      <main className="page-body">
        <div className="cat-intro">
          <h1 className="cat-title">{folder.name.toUpperCase()}</h1>
          <p className="cat-headline">
            {(folder.headline || folder.name).toUpperCase()}
          </p>
          <p className="cat-count">
            {String(sites.length).padStart(2, "0")} SOURCES
          </p>
        </div>
        <DirectoryGrid
          key={`${folder.id}:${folder.name}:${folder.slug}:${gridKey}`}
          folder={folder}
          folders={ctx.folders}
          initialSites={sites}
          isAdmin={ctx.isAdmin}
          focusId={focusId}
          focusKey={focusKey}
        />
      </main>
    </div>
  );
}
