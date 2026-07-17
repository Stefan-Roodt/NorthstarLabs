"use client";

import { FormEvent, useEffect, useState } from "react";
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
  community: { name: string; description: string; allowPosting: number; accessType: string };
  membership: { role: string; status: string };
  canModerate: boolean;
  currentUserId: string;
  posts: Post[];
  stats: { members: number; posts: number };
};

export default function Community() {
  const [data, setData] = useState<CommunityData | null>(null);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [accessError, setAccessError] = useState("");
  const supabase = getSupabaseBrowser();

  async function token() {
    return (await supabase?.auth.getSession())?.data.session?.access_token || "";
  }

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const accessToken = await token();
      if (!accessToken) {
        location.href = "/login?next=/community";
        return;
      }
      const response = await fetch("/api/community", {
        headers: { authorization: `Bearer ${accessToken}` },
      });
      const result = await response.json();
      if (response.ok) setData(result);
      else setAccessError(result.error || "Community access is unavailable.");
      setLoading(false);
    })();
  }, [supabase]);

  async function publish(event: FormEvent) {
    event.preventDefault();
    if (!body.trim() || !data) return;
    setMessage("Publishing...");
    const response = await fetch("/api/community", {
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
    const response = await fetch("/api/community", {
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
    const response = await fetch(`/api/community?postId=${encodeURIComponent(post.id)}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${await token()}` },
    });
    if (response.ok) {
      setData({ ...data, posts: data.posts.filter((item) => item.id !== post.id) });
    }
  }

  if (loading) return <main className="system-loading"><p>Opening the community...</p></main>;
  if (accessError || !data) {
    return <main className="system-loading"><div>
      <b>Community membership required</b>
      <p>{accessError}</p>
      <a className="sys-primary" href="/learn">Return to my learning</a>
    </div></main>;
  }

  const mayPost = Boolean(data.community.allowPosting || data.canModerate);
  return <main className="community-page">
    <header>
      <a className="system-brand" href="/">✦ NORTHSTARLABS</a>
      <nav>
        <a href="/learn">My learning</a>
        <a href="/courses">Courses</a>
        <a href="/account">Account</a>
        {data.canModerate && <a href="/dashboard/community">Manage community</a>}
      </nav>
    </header>
    <section className="community-hero">
      <div>
        <p className="sys-kicker">{data.membership.role.toUpperCase()} SPACE</p>
        <h1>Learn together.<br />Grow together.</h1>
        <p>{data.community.description}</p>
      </div>
      <aside>
        <strong>{data.stats.members}</strong>
        <span>active members</span>
      </aside>
    </section>
    <section className="community-stream">
      {mayPost ? <form className="panel community-composer" onSubmit={publish}>
        <label htmlFor="community-post">Share something with the circle</label>
        <textarea
          id="community-post"
          maxLength={1500}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Ask a question, share a win, or offer an insight..."
        />
        <div><small>{body.length}/1500</small><button className="sys-primary">Publish post</button></div>
        {message && <p className="form-message">{message}</p>}
      </form> : <div className="panel community-readonly">
        <b>Read-only mode</b>
        <p>Moderators have temporarily paused new member posts.</p>
      </div>}

      <div className="feed">
        <div className="feed-heading">
          <h2>Community feed</h2>
          <span>{data.stats.posts} conversations</span>
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
              {(data.canModerate || post.authorId === data.currentUserId) && <footer>
                {data.canModerate && <button onClick={() => moderate(post, post.status === "hidden" ? "restore" : "hide")}>
                  {post.status === "hidden" ? "Restore post" : "Hide post"}
                </button>}
                <button onClick={() => remove(post)}>Delete</button>
              </footer>}
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
