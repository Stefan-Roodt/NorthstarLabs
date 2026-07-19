"use client";

import { useEffect, useState } from "react";
import { CommunityView } from "../../../community/community-view";

export default function SchoolCommunity({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [slug, setSlug] = useState("");
  useEffect(() => {
    params.then((value) => setSlug(value.slug));
  }, [params]);
  if (!slug) return <main className="system-loading"><p>Opening the community...</p></main>;
  return <CommunityView schoolSlug={slug} />;
}
