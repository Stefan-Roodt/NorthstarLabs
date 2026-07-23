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

function validUrl(value: string | null) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function validateSchool(school: School) {
  const errors: Partial<Record<keyof School, string>> = {};
  if (school.name.trim().length < 2) errors.name = "Enter at least 2 characters, for example \"CogniZen Consulting\".";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(school.slug)) {
    errors.slug = "Use lowercase words separated by single hyphens, for example cognizen-consulting.";
  }
  if (school.supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(school.supportEmail)) {
    errors.supportEmail = "Use a complete email address, for example help@youracademy.com.";
  }
  for (const key of ["logoUrl", "coverImageUrl", "websiteUrl", "termsUrl", "privacyUrl"] as const) {
    if (!validUrl(school[key])) errors[key] = "Start the address with https:// and paste the complete public link.";
  }
  return errors;
}

export default function AcademySettings() {
  const [school, setSchool] = useState<School | null>(null);
  const [message, setMessage] = useState("Loading your academy...");
  const [saving, setSaving] = useState(false);
  const [attempted, setAttempted] = useState(false);
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
    setAttempted(true);
    const errors = validateSchool(school);
    if (Object.keys(errors).length) {
      setMessage("Some details need attention. Each problem is marked below with exactly how to fix it.");
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
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
  const errors = validateSchool(school);
  const readiness = [
    { label: "Academy name", ready: school.name.trim().length >= 2 },
    { label: "Learner description", ready: school.description.trim().length >= 40 },
    { label: "Support email", ready: Boolean(school.supportEmail) && !errors.supportEmail },
    { label: "Homepage headline", ready: Boolean(school.heroTitle.trim()) },
    { label: "Homepage promise", ready: school.heroDescription.trim().length >= 40 },
    { label: "Google search preview", ready: Boolean(school.seoTitle.trim() && school.seoDescription.trim()) },
  ];
  const readyCount = readiness.filter((item) => item.ready).length;
  const fieldError = (key: keyof School) => attempted ? errors[key] : undefined;

  return <main className="academy-editor" style={theme}>
    <header className="academy-editor-top">
      <Link href="/dashboard">← Creator workspace</Link>
      <div>
        <p className="sys-kicker">STOREFRONT & BRAND</p>
        <h1>Make the academy yours.</h1>
      </div>
      <a className="sys-primary" href={`https://northstarlabs.co.za/schools/${school.slug}`}>View live academy ↗</a>
    </header>

    <div className="academy-editor-layout">
      <form className="academy-settings" onSubmit={save} noValidate>
        <section className="academy-completion" aria-label="Storefront completion">
          <div><p className="sys-kicker">YOUR COMPLETION GUIDE</p><h2>{readyCount} of {readiness.length} essentials ready</h2><p>Complete these essentials first. Image links, colours and policy links are useful, but they will not stop you from publishing.</p></div>
          <div className="academy-completion-list">
            {readiness.map((item) => <span className={item.ready ? "ready" : ""} key={item.label}><b>{item.ready ? "✓" : "o"}</b>{item.label}</span>)}
          </div>
        </section>
        <section className="panel" id="academy-identity">
          <div className="academy-section-heading">
            <span>01</span>
            <div><h2>Identity</h2><p>The essentials learners see throughout your school.</p></div>
          </div>
          <div className="academy-form-grid">
            <label><span className="academy-field-label">Academy name <em>Required</em></span><input aria-invalid={Boolean(fieldError("name"))} required minLength={2} maxLength={80} value={school.name} onChange={(event) => update("name", event.target.value)} /><small>This is the public name learners will see across your academy.</small>{fieldError("name") && <strong className="academy-field-error">{fieldError("name")}</strong>}</label>
            <label><span className="academy-field-label">Support email <em>Recommended</em></span><input aria-invalid={Boolean(fieldError("supportEmail"))} type="email" maxLength={160} value={school.supportEmail} onChange={(event) => update("supportEmail", event.target.value)} placeholder="help@youracademy.com" /><small>Where learners can ask for help. Use an inbox you check regularly.</small>{fieldError("supportEmail") && <strong className="academy-field-error">{fieldError("supportEmail")}</strong>}</label>
            <label className="academy-span-two"><span className="academy-field-label">Short description <em>Recommended</em></span><textarea maxLength={600} value={school.description} onChange={(event) => update("description", event.target.value)} placeholder="We help first-time founders validate an idea and launch with confidence." /><small>In one or two sentences: who you help, what they learn, and the result. Aim for at least 40 characters.</small></label>
            <label><span className="academy-field-label">Logo image link <em>Optional</em></span><input aria-invalid={Boolean(fieldError("logoUrl"))} type="url" value={school.logoUrl || ""} onChange={(event) => update("logoUrl", event.target.value || null)} placeholder="https://example.com/logo.png" /><small>Paste a public PNG, JPG, WebP or SVG link. Leave blank to use your initials.</small>{fieldError("logoUrl") && <strong className="academy-field-error">{fieldError("logoUrl")}</strong>}</label>
            <label><span className="academy-field-label">Cover image link <em>Optional</em></span><input aria-invalid={Boolean(fieldError("coverImageUrl"))} type="url" value={school.coverImageUrl || ""} onChange={(event) => update("coverImageUrl", event.target.value || null)} placeholder="https://example.com/academy-cover.jpg" /><small>Paste a public wide image link. Recommended shape: 1600 x 900 pixels.</small>{fieldError("coverImageUrl") && <strong className="academy-field-error">{fieldError("coverImageUrl")}</strong>}</label>
            <label><span className="academy-field-label">Primary colour <em>Choose visually</em></span><span className="color-input"><input aria-label="Choose primary colour" type="color" value={school.primaryColor} onChange={(event) => update("primaryColor", event.target.value)} /><code>{school.primaryColor}</code></span><small>Used for main buttons and important links. Click the colour square to change it.</small></label>
            <label><span className="academy-field-label">Accent colour <em>Choose visually</em></span><span className="color-input"><input aria-label="Choose accent colour" type="color" value={school.accentColor} onChange={(event) => update("accentColor", event.target.value)} /><code>{school.accentColor}</code></span><small>Used for highlights and contrast. The preview updates immediately.</small></label>
            <label><span className="academy-field-label">Typography <em>Optional</em></span><select value={school.fontTheme} onChange={(event) => update("fontTheme", event.target.value)}>
              <option value="modern">Modern</option>
              <option value="editorial">Editorial</option>
              <option value="classic">Classic</option>
            </select><small>Modern is the safest choice. Use Editorial or Classic for a more traditional feel.</small></label>
            <label><span className="academy-field-label">Your website <em>Optional</em></span><input aria-invalid={Boolean(fieldError("websiteUrl"))} type="url" value={school.websiteUrl || ""} onChange={(event) => update("websiteUrl", event.target.value || null)} placeholder="https://youracademy.com" /><small>Only add this if you have a separate public website.</small>{fieldError("websiteUrl") && <strong className="academy-field-error">{fieldError("websiteUrl")}</strong>}</label>
            <label className="academy-span-two"><span className="academy-field-label">Public academy address <em>Required</em></span><input aria-invalid={Boolean(fieldError("slug"))} value={school.slug} onChange={(event) => update("slug", event.target.value.toLowerCase().replace(/\s+/g, "-"))} placeholder="cognizen-consulting" /><span className="academy-public-address"><code>northstarlabs.co.za/schools/{school.slug || "your-academy"}</code><small>Choose a short, professional address. If you change it, Northstar keeps the previous address working automatically.</small></span>{fieldError("slug") && <strong className="academy-field-error">{fieldError("slug")}</strong>}</label>
          </div>
        </section>

        <section className="panel">
          <div className="academy-section-heading">
            <span>02</span>
            <div><h2>Homepage</h2><p>Write the invitation people see before they browse your courses.</p></div>
          </div>
          <div className="academy-form-grid">
            <label className="academy-span-two"><span className="academy-field-label">Main homepage headline <em>Recommended</em></span><input maxLength={120} value={school.heroTitle} onChange={(event) => update("heroTitle", event.target.value)} placeholder={`Build practical skills with ${school.name}`} /><small>Promise a clear learner result. Example: &quot;Turn your business idea into a confident first launch.&quot;</small></label>
            <label className="academy-span-two"><span className="academy-field-label">Homepage promise <em>Recommended</em></span><textarea maxLength={320} value={school.heroDescription} onChange={(event) => update("heroDescription", event.target.value)} placeholder="Practical courses and personal guidance that help you move from uncertainty to action." /><small>Explain how you help and why learners should trust this academy. Aim for at least 40 characters.</small></label>
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
            <label><span className="academy-field-label">Google result title <em>Recommended</em></span><input maxLength={70} value={school.seoTitle} onChange={(event) => update("seoTitle", event.target.value)} placeholder={`${school.name} | Practical online courses`} /><small>The blue headline people may see in Google. Keep it under 70 characters.</small></label>
            <label><span className="academy-field-label">Google result description <em>Recommended</em></span><input maxLength={180} value={school.seoDescription} onChange={(event) => update("seoDescription", event.target.value)} placeholder="Practical courses and coaching for people ready to make progress." /><small>A plain-language reason to click, ideally 120-160 characters.</small></label>
            <label><span className="academy-field-label">Your terms page <em>Optional</em></span><input aria-invalid={Boolean(fieldError("termsUrl"))} type="url" value={school.termsUrl || ""} onChange={(event) => update("termsUrl", event.target.value || null)} placeholder="https://youracademy.com/terms" /><small>Leave blank to use the NorthstarLabs platform terms.</small>{fieldError("termsUrl") && <strong className="academy-field-error">{fieldError("termsUrl")}</strong>}</label>
            <label><span className="academy-field-label">Your privacy page <em>Optional</em></span><input aria-invalid={Boolean(fieldError("privacyUrl"))} type="url" value={school.privacyUrl || ""} onChange={(event) => update("privacyUrl", event.target.value || null)} placeholder="https://youracademy.com/privacy" /><small>Leave blank to use the NorthstarLabs privacy policy.</small>{fieldError("privacyUrl") && <strong className="academy-field-error">{fieldError("privacyUrl")}</strong>}</label>
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
            <span>Courses {school.showCommunity ? "- Community" : ""}</span>
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
