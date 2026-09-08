import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function MunicipalityPage({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/municipalities?city=${encodeURIComponent(slug)}`);
}
