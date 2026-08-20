import { redirect } from "next/navigation";

export default async function LegacyPracticeRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/vet-search/${encodeURIComponent(slug)}`);
}
