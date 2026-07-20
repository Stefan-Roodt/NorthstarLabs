"use client";

import Link from "next/link";
import { type CSSProperties, type FormEvent, useCallback, useEffect, useState } from "react";
import { getSupabaseBrowser } from "../../../lib/supabase-client";

type School = {
  id: string;
  slug: string;
  name: string;
  description: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
  primaryColor: string;
  accentColor: string;
  heroTitle: string;
  heroDescription: string;
  fontTheme: string;
  supportEmail: string;
  websiteUrl: string | null;
  seoTitle: string;
  seoDescription: string;
  showCommunity: number;
  termsUrl: string | null;
  privacyUrl: string | null;
};

type Profile = {
  activeSchool: { slug: string } | null;
  hasCreatorSchool: boolean;
};

export default function AcademySettings() {
  const [school, setSchool] = useState<School | null>(null);
  const [message, setMessage] = useState("Loading your academy...");
  const [saving, setSaving] = useState(false);
  const supabase = getSupabaseBrowser();

  const accessToken = useCallback(async () => {
    return (await supabase?.auth.getSession())?.data.session?.access_token || "";
  }, [supabase]);

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const token = await accessToken();
      if (!token) {
        location.href = "/login?next=/dashboard/academy";
        return;
      }
      const profileResponse = await fetch("/api/profile", {
        headers: { authorization: `Bearer ${token}` },
      });
      const profile = await profileResponse.json() as Profile & { error?: string };
      if (!profileResponse.ok || !profile.hasCreatorSchool || !profile.activeSchool) {
        location.href = "/welcome?path=creator";
        return;
      }
      const response = await fetch(`/api/schools/${encodeURIComponent(profile.activeSchool.slug)}`);
      const result = await response.json() as { school?: School; error?: string };
      if (!response.ok || !result.school) {
        setMessage(result.error || "Your academy settings could not be loaded.");
        return;
      }
      setSchool(result.school);
      setMessage("");
    })();
  }, [accessToken, supabase]);

  function update<K extends keyof School>(key: K, value: School[K]) {
    setSchool((current) => current ? { ...current, [key]: value } : current);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!school || saving) return;
    setSaving(true);
    setMessage("Saving your storefront...");
    const response = await fetch(`/api/schools/${encodeURIComponent(school.slug)}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${await accessToken()}`,
      },
      body: JSON.stringify(school),
    });
    const result = await response.json() as { school?: School; error?: string };
    if (response.ok && result.school) {
      setSchool(result.school);
      setMessage("Storefront saved and live.");
    } else {
      setMessage(result.error || "Your storefront could not be saved.");
    }
    setSaving(false);
  }

  if (!school) {
    return <main className="system-loading"><div><b>Academy storefront</b><p>{message}</p></div></main>;
  }

  const theme = {
    "--school-primary": school.primaryColor,
    "--school-accent": school.accentColor,
  } as CSSProperties;
  const title = school.heroTitle || `Learn with ${school.name}`;
  const description = school.heroDescription || school.description ||
    "Practical learning designed to help people make meaningful progress.";

  return <main className="academy-editor" style={theme}>
    <header className="academy-editor-top">
      <Link href="/dashboard">← Creator workspace</Link>
      <div>
        <p className="sys-kicker">STOREFRONT & BRAND</p>
        <h1>Make the academy yours.</h1>
      </div>
      <Link className="sys-primary" href={`/schools/${school.slug}`}>View live academy ↗</Link>
    </header>

    <div className="academy-editor-layout">
      <form className="academy-settings" onSubmit={save}>
        <section className="panel" id="academy-identity">
          <div className="academy-section-heading">
            <span>01</span>
            <div><h2>Identity</h2><p>The essentials learners see throughout your school.</p></div>
          </div>
          <div className="academy-form-grid">
            <label>Academy name<input required minLength={2} maxLength={80} value={school.name} onChange={(event) => update("name", event.target.value)} /></label>
            <label>Support email<input type="email" maxLength={160} value={school.supportEmail} onChange={(event) => update("supportEmail", event.target.value)} placeholder="help@youracademy.com" /></label>
            <label className="academy-span-two">Short description<textarea maxLength={600} value={school.description} onChange={(event) => update("description", event.target.value)} placeholder="What your academy helps people achieve." /></label>
            <label>Logo URL<input type="url" value={school.logoUrl || ""} onChange={(event) => update("logoUrl", event.target.value || null)} placeholder="https://..." /></label>
            <label>Cover image URL<input type="url" value={school.coverImageUrl || ""} onChange={(event) => update("coverImageUrl", event.target.value || null)} placeholder="https://..." /></label>
            <label>Primary colour<span className="color-input"><input type="color" value={school.primaryColor} onChange={(event) => update("primaryColor", event.target.value)} /><code>{school.primaryColor}</code></span></label>
            <label>Accent colour<span className="color-input"><input type="color" value={school.accentColor} onChange={(event) => update("accentColor", event.target.value)} /><code>{school.accentColor}</code></span></label>
            <label>Typography<select value={school.fontTheme} onChange={(event) => update("fontTheme", event.target.value)}>
              <option value="modern">Modern</option>
              <option value="editorial">Editorial</option>
              <option value="classic">Classic</option>
            </select></label>
            <label>Website URL<input type="url" value={school.websiteUrl || ""} onChange={(event) => update("websiteUrl", event.target.value || null)} placeholder="https://..." /></label>
          </div>
        </section>

        <section className="panel">
          <div className="academy-section-heading">
            <span>02</span>
            <div><h2>Homepage</h2><p>Write the invitation people see before they browse your courses.</p></div>
          </div>
          <div className="academy-form-grid">
            <label className="academy-span-two">Hero headline<input maxLength={120} value={school.heroTitle} onChange={(event) => update("heroTitle", event.target.value)} placeholder={`Learn with ${school.name}`} /></label>
            <label className="academy-span-two">Hero description<textarea maxLength={320} value={school.heroDescription} onChange={(event) => update("heroDescription", event.target.value)} placeholder="A specific, useful promise for your learners." /></label>
            <label className="academy-switch academy-span-two">
              <input type="checkbox" checked={Boolean(school.showCommunity)} onChange={(event) => update("showCommunity", event.target.checked ? 1 : 0)} />
              <span><b>Show the community</b><small>Add a private community link to this academy and its learner navigation.</small></span>
            </label>
          </div>
        </section>

        <section className="panel">
          <div className="academy-section-heading">
            <span>03</span>
            <div><h2>Discovery & trust</h2><p>Control search previews and connect your own policies.</p></div>
          </div>
          <div className="academy-form-grid">
            <label>Search title<input maxLength={70} value={school.seoTitle} onChange={(event) => update("seoTitle", event.target.value)} placeholder={`${school.name} courses`} /></label>
            <label>Search description<input maxLength={180} value={school.seoDescription} onChange={(event) => update("seoDescription", event.target.value)} placeholder="A concise reason to visit your academy." /></label>
            <label>Terms URL<input type="url" value={school.termsUrl || ""} onChange={(event) => update("termsUrl", event.target.value || null)} placeholder="https://..." /></label>
            <label>Privacy URL<input type="url" value={school.privacyUrl || ""} onChange={(event) => update("privacyUrl", event.target.value || null)} placeholder="https://..." /></label>
          </div>
        </section>

        {message && <div className="notice" role="status">{message}</div>}
        <button className="sys-primary academy-save" disabled={saving}>
          {saving ? "Saving..." : "Save and publish storefront"}
        </button>
      </form>

      <aside className={`academy-preview font-${school.fontTheme}`}>
        <p className="sys-kicker">LIVE PREVIEW</p>
        <div className="academy-preview-browser">
          <div className="academy-preview-nav">
            <BrandMark school={school} />
            <span>Courses {school.showCommunity ? "· Community" : ""}</span>
          </div>
          <div className="academy-preview-hero">
            {school.coverImageUrl && <div className="academy-preview-cover" style={{ backgroundImage: `url(${school.coverImageUrl})` }} />}
            <p>WELCOME TO {school.name.toUpperCase()}</p>
            <h2>{title}</h2>
            <span>{description}</span>
            <button>Explore courses</button>
          </div>
          <div className="academy-preview-cards"><i /><i /><i /></div>
        </div>
      </aside>
    </div>
  </main>;
}

function BrandMark({ school }: { school: School }) {
  if (school.logoUrl) {
    return <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={school.logoUrl} alt="" />
      <b>{school.name}</b>
    </>;
  }
  return <b><i>{school.name.slice(0, 2).toUpperCase()}</i>{school.name}</b>;
}
