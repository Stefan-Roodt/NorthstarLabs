"use client";

import Link from "next/link";
import { type CSSProperties, type FormEvent, useCallback, useEffect, useState } from "react";
import { getSupabaseBrowser } from "../../lib/supabase-client";

type Post = {
  id: string;
  body: string;
  createdAt: number;
  author: string;
  authorId: string;
  authorEmail?: string;
  status: string;
};
type CommunityData = {
  school: {
    id: string;
    slug: string;
    name: string;
    logoUrl: string | null;
    primaryColor: string;
    accentColor: string;
    showCommunity: number;
  };
  community: { name: string; description: string; allowPosting: number; accessType: string };
  membership: { role: string; status: string };
  canModerate: boolean;
  currentUserId: string;
  posts: Post[];
  stats: { members: number; posts: number };
};

export function CommunityView({ schoolSlug }: { schoolSlug?: string }) {
  const [data, setData] = useState<CommunityData | null>(null);
  const [body, setBody] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [accessError, setAccessError] = useState("");
  const supabase = getSupabaseBrowser();

  const token = useCallback(async () => {
    return (await supabase?.auth.getSession())?.data.session?.access_token || "";
  }, [supabase]);

  function communityApi(postId?: string) {
    const query = new URLSearchParams();
    if (schoolId) query.set("schoolId", schoolId);
    if (postId) query.set("postId", postId);
    const suffix = query.toString();
    return `/api/community${suffix ? `?${suffix}` : ""}`;
  }

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const accessToken = await token();
      const returnTo = schoolSlug ? `/schools/${schoolSlug}/community` : "/community";
      if (!accessToken) {
        location.href = `/login?next=${encodeURIComponent(returnTo)}`;
        return;
      }
      let targetSchoolId = "";
      if (schoolSlug) {
        const schoolResponse = await fetch(`/api/schools/${encodeURIComponent(schoolSlug)}`);
        const schoolResult = await schoolResponse.json() as { school?: { id: string }; error?: string };
        if (!schoolResponse.ok || !schoolResult.school) {
          setAccessError(schoolResult.error || "This academy could not be found.");
          setLoading(false);
          return;
        }
        targetSchoolId = schoolResult.school.id;
        setSchoolId(targetSchoolId);
      }
      const response = await fetch(
        `/api/community${targetSchoolId ? `?schoolId=${encodeURIComponent(targetSchoolId)}` : ""}`,
        { headers: { authorization: `Bearer ${accessToken}` } },
      );
      const result = await response.json();
      if (response.ok) {
        setData(result);
        if (!targetSchoolId) setSchoolId(result.school?.id || "");
      } else {
        setAccessError(result.error || "Community access is unavailable.");
      }
      setLoading(false);
    })();
  }, [schoolSlug, supabase, token]);

  async function publish(event: FormEvent) {
    event.preventDefault();
    if (!body.trim() || !data) return;
    setMessage("Publishing...");
    const response = await fetch(communityApi(), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${await token()}`,
      },
      body: JSON.stringify({ body }),
    });
    const result = await response.json();
    if (response.ok) {
      setData({
        ...data,
        posts: [result, ...data.posts],
        stats: { ...data.stats, posts: Number(data.stats.posts || 0) + 1 },
      });
      setBody("");
      setMessage("Posted to the community.");
    } else {
      setMessage(result.error || "Your post could not be published.");
    }
  }

  async function moderate(post: Post, action: "hide" | "restore") {
    if (!data) return;
    const response = await fetch(communityApi(), {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${await token()}`,
      },
      body: JSON.stringify({ postId: post.id, action }),
    });
    if (response.ok) {
      setData({
        ...data,
        posts: data.posts.map((item) => item.id === post.id
          ? { ...item, status: action === "hide" ? "hidden" : "visible" }
          : item),
      });
    }
  }

  async function remove(post: Post) {
    if (!data || !confirm("Delete this post permanently?")) return;
    const response = await fetch(communityApi(post.id), {
      method: "DELETE",
      headers: { authorization: `Bearer ${await token()}` },
    });
    if (response.ok) {
      setData({ ...data, posts: data.posts.filter((item) => item.id !== post.id) });
    }
  }

  async function reportPost(post: Post) {
    if (!data) return;
    const detail = prompt(
      "Briefly tell the moderation team why this post should be reviewed.",
    );
    if (detail === null) return;
    const response = await fetch("/api/community/reports", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${await token()}`,
      },
      body: JSON.stringify({
        schoolId: data.school.id,
        postId: post.id,
        reason: "other",
        detail,
      }),
    });
    const result = await response.json();
    setMessage(response.ok
      ? result.message || "Post reported for review."
      : result.error || "The report could not be submitted.");
  }

  if (loading) return <main className="system-loading"><p>Opening the community...</p></main>;
  if (accessError || !data) {
    return <main className="system-loading"><div>
      <b>Community membership required</b>
      <p>{accessError}</p>
      <a className="sys-primary" href={schoolSlug ? `/schools/${schoolSlug}` : "/learn"}>Return to the academy</a>
    </div></main>;
  }

  const mayPost = Boolean(data.community.allowPosting || data.canModerate);
  const style = {
    "--blue": data.school.primaryColor,
    "--acid": data.school.accentColor,
  } as CSSProperties;
  return <main className="community-page school-community-page" style={style}>
    <header>
      <a className="school-community-brand" href={`/schools/${data.school.slug}`}>
        {data.school.logoUrl ? <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.school.logoUrl} alt="" />
        </> : <i>{data.school.name.slice(0, 2).toUpperCase()}</i>}
        <b>{data.school.name}</b>
      </a>
      <nav>
        <Link href="/learn">My learning</Link>
        <a href={`/schools/${data.school.slug}`}>Courses</a>
        <a href="/account">Account</a>
        {data.canModerate &&
          <a href={`/dashboard/community?schoolId=${encodeURIComponent(data.school.id)}`}>Manage community</a>}
      </nav>
    </header>
    <section className="community-hero">
      <div>
        <p className="sys-kicker">{data.membership.role.toUpperCase()} SPACE · {data.school.name.toUpperCase()}</p>
        <h1>{data.community.name}</h1>
        <p>{data.community.description}</p>
      </div>
      <aside><strong>{data.stats.members}</strong><span>active members</span></aside>
    </section>
    <section className="community-stream">
      {mayPost ? <form className="panel community-composer" onSubmit={publish}>
        <label htmlFor="community-post">Share with your learning community</label>
        <textarea id="community-post" maxLength={1500} value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Ask a question, share a win, or offer an insight..." />
        <div><small>{body.length}/1500</small><button className="sys-primary">Publish post</button></div>
        {message && <p className="form-message">{message}</p>}
      </form> : <div className="panel community-readonly">
        <b>Read-only mode</b>
        <p>Moderators have temporarily paused new member posts.</p>
      </div>}

      <div className="feed">
        <div className="feed-heading">
          <h2>Community feed</h2><span>{data.stats.posts} conversations</span>
        </div>
        {data.posts.length ? data.posts.map((post) =>
          <article className={`panel community-post ${post.status === "hidden" ? "post-hidden" : ""}`} key={post.id}>
            <span>{post.author.slice(0, 2).toUpperCase()}</span>
            <div>
              <header>
                <div><b>{post.author}</b>{post.status === "hidden" && <em>Hidden</em>}</div>
                <small>{new Date(post.createdAt).toLocaleDateString("en-ZA", {
                  day: "numeric", month: "short", year: "numeric",
                })}</small>
              </header>
              <p>{post.body}</p>
              <footer>
                {data.canModerate && <button onClick={() => moderate(post, post.status === "hidden" ? "restore" : "hide")}>
                  {post.status === "hidden" ? "Restore post" : "Hide post"}
                </button>}
                {(data.canModerate || post.authorId === data.currentUserId) &&
                  <button onClick={() => remove(post)}>Delete</button>}
                {post.authorId !== data.currentUserId &&
                  <button onClick={() => reportPost(post)}>Report</button>}
              </footer>
            </div>
          </article>
        ) : <article className="panel empty-dashboard">
          <h2>Start the first conversation</h2>
          <p>Welcome the community, ask a question, or share what you are building.</p>
        </article>}
      </div>
    </section>
  </main>;
}
