import EntryGate from "@/components/entry/EntryGate";

export default async function Page({ searchParams }: PageProps<"/">) {
  const { view, error } = await searchParams;
  return (
    <EntryGate
      initialView={
        view === "reset" ? "reset-password" : view === "login" ? "login" : "entry"
      }
      initialError={typeof error === "string" ? error : ""}
    />
  );
}
