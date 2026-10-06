import CategoryPage from "@/components/directory/CategoryPage";

export default async function FolderPage({
  params,
  searchParams,
}: PageProps<"/[slug]">) {
  const { slug } = await params;
  const { focus, t } = await searchParams;
  return (
    <CategoryPage
      slug={slug}
      focusId={typeof focus === "string" ? focus : undefined}
      focusKey={typeof t === "string" ? t : undefined}
    />
  );
}
