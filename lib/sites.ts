// directory 타입과 검색. 데이터의 Source of Truth 는 Supabase (folders / sites) 이다.

export type Folder = {
  id: string;
  name: string;
  slug: string;
  headline: string | null;
  sortOrder: number;
};

export type Site = {
  id: string;
  folderId: string;
  name: string; // sites.title
  url: string;
  desc: string; // sites.description
  image: string; // sites.image_url ("" 이면 placeholder). 카드와 검색 결과가 함께 쓴다.
  tag: string;
  sortOrder: number;
};

export type SearchHit = { folder: Folder; site: Site };

// 카드와 같은 데이터에서 name / folder / tag / desc 를 대소문자 구분 없이 검색한다.
// 순위: name 시작 > name 포함 > folder·tag 포함 > desc 포함.
export function searchSites(
  folders: Folder[],
  sites: Site[],
  query: string,
): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const byId = new Map(folders.map((f) => [f.id, f]));
  const hits: { hit: SearchHit; score: number }[] = [];
  for (const site of sites) {
    const folder = byId.get(site.folderId);
    if (!folder) continue;
    const name = site.name.toLowerCase();
    let score = -1;
    if (name.startsWith(q)) score = 0;
    else if (name.includes(q)) score = 1;
    else if (
      folder.name.toLowerCase().includes(q) ||
      folder.slug.includes(q) ||
      site.tag.toLowerCase().includes(q)
    )
      score = 2;
    else if (site.desc.toLowerCase().includes(q)) score = 3;
    if (score >= 0) hits.push({ hit: { folder, site }, score });
  }
  return hits.sort((a, b) => a.score - b.score).map((h) => h.hit);
}
