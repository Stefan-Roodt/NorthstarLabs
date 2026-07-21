import { env } from "cloudflare:workers";

export const DEMAND_CATEGORIES = [
  "business", "technology", "finance", "career", "education", "personal-growth", "other",
] as const;
export const DEMAND_FORMATS = ["course", "coach", "live", "either"] as const;
export const DEMAND_STATUSES = ["open", "planned", "building", "released", "declined"] as const;

export type PublicDemandTopic = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  preferredFormat: string;
  status: string;
  publicNote: string;
  matchedUrl: string | null;
  createdAt: number;
  updatedAt: number;
  releasedAt: number | null;
  score: number;
  supporters: number;
  downvotes: number;
  followers: number;
  viewerVote: number;
};

export function demandSlug(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 72) || "learning-request";
}

export async function uniqueDemandSlug(title: string) {
  const base = demandSlug(title);
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const slug = attempt ? `${base}-${attempt + 1}` : base;
    const exists = await env.DB.prepare("SELECT id FROM demand_topics WHERE slug=?").bind(slug).first();
    if (!exists) return slug;
  }
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function publicDemandTopics(input: {
  voterKeyHash?: string;
  category?: string;
  status?: string;
  query?: string;
  sort?: string;
} = {}) {
  const category = DEMAND_CATEGORIES.includes(input.category as typeof DEMAND_CATEGORIES[number]) ? input.category : "";
  const status = DEMAND_STATUSES.includes(input.status as typeof DEMAND_STATUSES[number]) ? input.status : "";
  const query = String(input.query || "").trim().toLowerCase().slice(0, 100);
  const order = input.sort === "new"
    ? "t.created_at DESC"
    : input.sort === "roadmap"
      ? "CASE t.status WHEN 'building' THEN 0 WHEN 'planned' THEN 1 WHEN 'open' THEN 2 WHEN 'released' THEN 3 ELSE 4 END,t.updated_at DESC"
      : "score DESC,supporters DESC,t.updated_at DESC";
  const rows = await env.DB.prepare(
    `SELECT t.id,t.title,t.slug,t.summary,t.category,t.preferred_format AS preferredFormat,
      t.status,t.public_note AS publicNote,t.matched_url AS matchedUrl,
      t.created_at AS createdAt,t.updated_at AS updatedAt,t.released_at AS releasedAt,
      COALESCE(SUM(v.value),0) AS score,
      COALESCE(SUM(CASE WHEN v.value=1 THEN 1 ELSE 0 END),0) AS supporters,
      COALESCE(SUM(CASE WHEN v.value=-1 THEN 1 ELSE 0 END),0) AS downvotes,
      (SELECT COUNT(*) FROM demand_followers f WHERE f.topic_id=t.id AND f.status='active') AS followers,
      COALESCE((SELECT value FROM demand_votes mine WHERE mine.topic_id=t.id AND mine.voter_key_hash=?),0) AS viewerVote
     FROM demand_topics t LEFT JOIN demand_votes v ON v.topic_id=t.id
     WHERE t.visibility='published' AND (?='' OR t.category=?) AND (?='' OR t.status=?)
       AND (?='' OR lower(t.title) LIKE '%'||?||'%' OR lower(t.summary) LIKE '%'||?||'%')
     GROUP BY t.id ORDER BY ${order} LIMIT 100`,
  ).bind(input.voterKeyHash || "", category, category, status, status, query, query, query).all<PublicDemandTopic>();
  return rows.results.map((topic) => ({
    ...topic,
    score: Number(topic.score || 0),
    supporters: Number(topic.supporters || 0),
    downvotes: Number(topic.downvotes || 0),
    followers: Number(topic.followers || 0),
    viewerVote: Number(topic.viewerVote || 0),
  }));
}
