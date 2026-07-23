"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "../../../lib/supabase-client";

type Member = {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  role: string;
  status: string;
  joinedAt: number;
};
type ManagementData = {
  school: { id: string; slug: string; name: string };
  community: {
    name: string;
    description: string;
    accessType: string;
    allowPosting: number;
  };
  isOwner: boolean;
  members: Member[];
};

export default function CommunityManagement() {
  const [data, setData] = useState<ManagementData | null>(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("Loading member access...");
  const supabase = getSupabaseBrowser();
  const searchParams = useSearchParams();
  const requestedSchoolId = searchParams.get("schoolId") || "";
  const managementApi = `/api/community/manage${requestedSchoolId
    ? `?schoolId=${encodeURIComponent(requestedSchoolId)}`
    : ""}`;

  const token = useCallback(async () => {
    return (await supabase?.auth.getSession())?.data.session?.access_token || "";
  }, [supabase]);

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const accessToken = await token();
      if (!accessToken) {
        location.href = "/login?next=/dashboard/community";
        return;
      }
      const response = await fetch(managementApi, {
        headers: { authorization: `Bearer ${accessToken}` },
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.error || "Community management is unavailable.");
        return;
      }
      setData(result);
      setMessage("");
    })();
  }, [managementApi, supabase, token]);

  async function saveSettings(patch: Partial<ManagementData["community"]>) {
    if (!data) return;
    const community = { ...data.community, ...patch };
    setData({ ...data, community });
    setMessage("Saving access rules...");
    const response = await fetch(managementApi, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${await token()}`,
      },
      body: JSON.stringify({
        type: "settings",
        accessType: community.accessType,
        allowPosting: Boolean(community.allowPosting),
      }),
    });
    setMessage(response.ok ? "Access rules saved." : "Access rules could not be saved.");
  }

  async function addMember(event: FormEvent) {
    event.preventDefault();
    if (!data || !email.trim()) return;
    setMessage("Adding member...");
    const response = await fetch(managementApi, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${await token()}`,
      },
      body: JSON.stringify({ email }),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error || "Member could not be added.");
      return;
    }
    setData({
      ...data,
      members: [result, ...data.members.filter((member) => member.userId !== result.userId)],
    });
    setEmail("");
    setMessage("Member access granted.");
  }

  async function updateMember(member: Member, patch: Partial<Member>) {
    if (!data) return;
    const next = { ...member, ...patch };
    setData({
      ...data,
      members: data.members.map((item) => item.id === member.id ? next : item),
    });
    setMessage(`Updating ${member.displayName}...`);
    const response = await fetch(managementApi, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${await token()}`,
      },
      body: JSON.stringify({
        type: "member",
        memberId: member.id,
        role: next.role,
        status: next.status,
      }),
    });
    const result = await response.json();
    setMessage(response.ok ? "Member access updated." : result.error || "Member could not be updated.");
    if (!response.ok) {
      setData({
        ...data,
        members: data.members.map((item) => item.id === member.id ? member : item),
      });
    }
  }

  if (!data) return <main className="system-loading"><div><b>NorthstarLabs</b><p>{message}</p></div></main>;

  const activeMembers = data.members.filter((member) => member.status === "active").length;
  const moderators = data.members.filter((member) => member.role === "moderator" && member.status === "active").length;

  return <main className="community-admin">
    <header className="community-admin-top">
      <a href="/dashboard">← Creator workspace</a>
      <div><p className="sys-kicker">COMMUNITY MANAGEMENT</p><h1>{data.community.name}</h1></div>
      <a className="sys-primary" href={`/schools/${data.school.slug}/community`}>Open community</a>
    </header>
    <section className="community-admin-body">
      <div className="metric-row">
        <article><span>Active members</span><strong>{activeMembers}</strong><small>Can enter the community</small></article>
        <article><span>Moderators</span><strong>{moderators}</strong><small>Can manage posts and members</small></article>
        <article><span>Access mode</span><strong className="metric-word">{data.community.accessType}</strong><small>Current joining rule</small></article>
      </div>

      {data.isOwner && <article className="panel access-settings">
        <div>
          <p className="sys-kicker">MEMBERSHIP ENTITLEMENTS</p>
          <h2>Choose who may enter</h2>
          <p>Existing active members retain access when the joining rule changes.</p>
        </div>
        <label>
          Community access
          <select
            value={data.community.accessType}
            onChange={(event) => saveSettings({ accessType: event.target.value })}
          >
            <option value="open">All signed-in users</option>
            <option value="enrolled">Enrolled learners and creators</option>
            <option value="invite">Invited members only</option>
          </select>
        </label>
        <label className="posting-toggle">
          <input
            type="checkbox"
            checked={Boolean(data.community.allowPosting)}
            onChange={(event) => saveSettings({ allowPosting: event.target.checked ? 1 : 0 })}
          />
          Members may publish posts
        </label>
      </article>}

      <article className="panel member-manager">
        <div className="member-manager-heading">
          <div>
            <p className="sys-kicker">MEMBER MANAGEMENT</p>
            <h2>People and permissions</h2>
          </div>
          <form onSubmit={addMember}>
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Registered member email"
            />
            <button className="sys-primary">Grant access</button>
          </form>
        </div>
        {message && <div className="notice">{message}</div>}
        <div className="member-list">
          {data.members.map((member) =>
            <div className="member-row" key={member.id}>
              <span>{member.displayName.slice(0, 2).toUpperCase()}</span>
              <div><b>{member.displayName}</b><small>{member.email}</small></div>
              {member.role === "owner" ? <strong>Owner</strong> : <select
                aria-label={`${member.displayName} role`}
                value={member.role}
                disabled={!data.isOwner}
                onChange={(event) => updateMember(member, { role: event.target.value })}
              >
                <option value="member">Member</option>
                <option value="moderator">Moderator</option>
              </select>}
              {member.role === "owner" ? <strong>Active</strong> : <button
                className={member.status === "blocked" ? "member-blocked" : ""}
                onClick={() => updateMember(member, {
                  status: member.status === "active" ? "blocked" : "active",
                })}
              >
                {member.status === "active" ? "Pause access" : "Restore access"}
              </button>}
            </div>
          )}
        </div>
      </article>
    </section>
  </main>;
}
