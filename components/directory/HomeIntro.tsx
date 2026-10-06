import Link from "next/link";
import TopNavigation from "@/components/navigation/TopNavigation";
import { getDirectoryContext } from "@/lib/directory";

export default async function HomeIntro() {
  const ctx = await getDirectoryContext();
  const navKey = ctx.folders
    .map((f) => `${f.id}:${f.name}:${f.slug}:${f.sortOrder}`)
    .join("|");

  return (
    <div className="page home-page">
      <TopNavigation
        key={navKey}
        folders={ctx.folders}
        sites={ctx.sites}
        isAdmin={ctx.isAdmin}
        signedIn={ctx.signedIn}
        email={ctx.email}
      />
      <main className="wrap page-body">
        <p className="home-lead">
          A CURATED DIRECTORY FOR
          <br />
          DATA, DESIGN AND DIGITAL TOOLS.
        </p>

        <div
          className="home-cols"
          style={{ "--cols": Math.min(Math.max(ctx.folders.length, 1), 5) } as React.CSSProperties}
        >
          {ctx.folders.map((f) => (
            <section key={f.id} className="home-col">
              <h2 className="home-col-title">{f.name.toUpperCase()}</h2>
              <ul className="home-col-list">
                {ctx.sites
                  .filter((s) => s.folderId === f.id)
                  .slice(0, 5)
                  .map((site, i) => (
                    <li key={site.id}>
                      <a
                        href={site.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="home-num">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="home-name">{site.name}</span>
                      </a>
                    </li>
                  ))}
              </ul>
              <Link href={`/${f.slug}`} className="home-col-more">
                VIEW {f.name.toUpperCase()} →
              </Link>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
