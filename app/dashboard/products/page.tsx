"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowser } from "../../../lib/supabase-client";

type Course = { id: string; title: string; status: string };
type Product = {
  id: string;
  name: string;
  description: string;
  productType: string;
  priceCents: number;
  billingInterval: string;
  status: string;
  includesCommunity: number;
  accessDurationDays: number;
  activeMembers: number;
  items: { itemId: string; title: string | null }[];
};
type Entitlement = {
  id: string;
  productId: string;
  productName: string;
  productType: string;
  email: string;
  displayName: string;
  status: string;
  startsAt: number;
  expiresAt: number | null;
};
type ProductData = {
  school: { id: string; slug: string; name: string };
  products: Product[];
  courses: Course[];
  community: { id: string; name: string } | null;
};
type ServiceProvider = { id: string; slug: string; name: string; memberRole: string };

const productNames: Record<string, string> = {
  bundle: "Course bundle",
  membership: "Membership",
  live_program: "Live programme",
};

export default function ProductsPage() {
  const supabase = getSupabaseBrowser();
  const [data, setData] = useState<ProductData | null>(null);
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [editingId, setEditingId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [productType, setProductType] = useState("bundle");
  const [priceRand, setPriceRand] = useState("0");
  const [billingInterval, setBillingInterval] = useState("one_time");
  const [durationDays, setDurationDays] = useState("0");
  const [courseIds, setCourseIds] = useState<string[]>([]);
  const [includesCommunity, setIncludesCommunity] = useState(false);
  const [grantProductId, setGrantProductId] = useState("");
  const [grantEmail, setGrantEmail] = useState("");
  const [grantExpiry, setGrantExpiry] = useState("");
  const [message, setMessage] = useState("Loading your products...");
  const [busy, setBusy] = useState("");

  const token = useCallback(async () => {
    return (await supabase?.auth.getSession())?.data.session?.access_token || "";
  }, [supabase]);

  const authed = useCallback(async (path: string, init?: RequestInit) => {
    const accessToken = await token();
    return fetch(path, {
      ...init,
      headers: {
        ...(init?.body ? { "content-type": "application/json" } : {}),
        authorization: `Bearer ${accessToken}`,
        ...(init?.headers || {}),
      },
    });
  }, [token]);

  const load = useCallback(async () => {
    if (!supabase) return;
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      location.href = "/login?next=/dashboard/products";
      return;
    }
    const [productsResponse, grantsResponse, profileResponse] = await Promise.all([
      authed("/api/products"),
      authed("/api/products/grants"),
      authed("/api/profile"),
    ]);
    if (productsResponse.ok) {
      const result = await productsResponse.json() as ProductData;
      setData(result);
      setGrantProductId((current) => current || result.products[0]?.id || "");
      setMessage("");
    } else {
      setMessage("Your product studio could not be loaded.");
    }
    if (grantsResponse.ok) {
      const result = await grantsResponse.json() as { entitlements: Entitlement[] };
      setEntitlements(result.entitlements);
    }
    if (profileResponse.ok) {
      const result = await profileResponse.json() as { schools?: ServiceProvider[] };
      setServiceProviders(result.schools || []);
    }
  }, [authed, supabase]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const selectedProduct = useMemo(
    () => data?.products.find((product) => product.id === editingId) || null,
    [data, editingId],
  );

  function resetEditor() {
    setEditingId("");
    setName("");
    setDescription("");
    setProductType("bundle");
    setPriceRand("0");
    setBillingInterval("one_time");
    setDurationDays("0");
    setCourseIds([]);
    setIncludesCommunity(false);
  }

  function editProduct(product: Product) {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description);
    setProductType(product.productType);
    setPriceRand(String(product.priceCents / 100));
    setBillingInterval(product.billingInterval === "free" ? "one_time" : product.billingInterval);
    setDurationDays(String(product.accessDurationDays || 0));
    setCourseIds(product.items.map((item) => item.itemId));
    setIncludesCommunity(Boolean(product.includesCommunity));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleCourse(courseId: string) {
    setCourseIds((current) => current.includes(courseId)
      ? current.filter((id) => id !== courseId)
      : [...current, courseId]);
  }

  async function switchServiceProvider(activeSchoolId: string) {
    if (!activeSchoolId || activeSchoolId === data?.school.id) return;
    setBusy("provider");
    setMessage("Opening the selected service provider...");
    const response = await authed("/api/profile", {
      method: "PATCH",
      body: JSON.stringify({ activeSchoolId }),
    });
    if (response.ok) {
      location.reload();
      return;
    }
    const result = await response.json() as { error?: string };
    setMessage(result.error || "That service provider could not be opened.");
    setBusy("");
  }

  async function saveProduct(event: FormEvent) {
    event.preventDefault();
    setBusy("product");
    setMessage("");
    const response = await authed("/api/products", {
      method: editingId ? "PATCH" : "POST",
      body: JSON.stringify({
        ...(editingId ? { id: editingId } : {}),
        name,
        description,
        productType,
        priceCents: Math.round(Math.max(0, Number(priceRand || 0)) * 100),
        billingInterval,
        accessDurationDays: Math.max(0, Number(durationDays || 0)),
        courseIds,
        includesCommunity,
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error || "The product could not be saved.");
      setBusy("");
      return;
    }
    setMessage(editingId ? "Product changes saved." : "Product created as a draft.");
    resetEditor();
    await load();
    setBusy("");
  }

  async function setProductStatus(product: Product, status: "published" | "draft" | "archived") {
    if (status === "archived" && !confirm(`Archive ${product.name}? Existing learner access is retained.`)) return;
    setBusy(product.id);
    const response = status === "archived"
      ? await authed(`/api/products?id=${encodeURIComponent(product.id)}`, { method: "DELETE" })
      : await authed("/api/products", {
        method: "PATCH",
        body: JSON.stringify({ id: product.id, status }),
      });
    const result = await response.json();
    setMessage(response.ok
      ? status === "published" ? "Product published to the academy storefront."
        : status === "draft" ? "Product returned to draft."
          : "Product archived."
      : result.error || "The product status could not be changed.");
    await load();
    setBusy("");
  }

  async function grantAccess(event: FormEvent) {
    event.preventDefault();
    setBusy("grant");
    const response = await authed("/api/products/grants", {
      method: "POST",
      body: JSON.stringify({
        productId: grantProductId,
        email: grantEmail,
        expiresAt: grantExpiry ? new Date(`${grantExpiry}T23:59:59`).getTime() : null,
      }),
    });
    const result = await response.json();
    setMessage(response.ok
      ? `Access granted to ${result.email}. Included courses and live sessions are ready.`
      : result.error || "Access could not be granted.");
    if (response.ok) {
      setGrantEmail("");
      setGrantExpiry("");
      await load();
    }
    setBusy("");
  }

  async function revokeAccess(entitlement: Entitlement) {
    if (!confirm(`Revoke ${entitlement.productName} from ${entitlement.email}?`)) return;
    setBusy(entitlement.id);
    const response = await authed("/api/products/grants", {
      method: "PATCH",
      body: JSON.stringify({ entitlementId: entitlement.id, action: "revoke" }),
    });
    const result = await response.json();
    setMessage(response.ok ? "Product access revoked." : result.error || "Access could not be revoked.");
    await load();
    setBusy("");
  }

  if (!data) {
    return <main className="system-loading"><div><b>NorthStarLabs</b><p>{message}</p></div></main>;
  }

  return <main className="product-admin-page">
    <header className="product-admin-top">
      <Link className="system-brand" href="/dashboard">✦ NORTHSTARLABS</Link>
      <div className="product-provider-controls">
        <label>
          <span>Service provider</span>
          <select
            aria-label="Choose service provider"
            disabled={busy === "provider"}
            value={data.school.id}
            onChange={(event) => void switchServiceProvider(event.target.value)}
          >
            {serviceProviders.length
              ? serviceProviders.map((provider) =>
                <option key={provider.id} value={provider.id}>{provider.name}</option>
              )
              : <option value={data.school.id}>{data.school.name}</option>}
          </select>
        </label>
        <nav>
          <Link href="/dashboard/live">Live learning</Link>
          <Link href="/dashboard/integrations">Integrations</Link>
          <Link href={`/schools/${data.school.slug}`}>Storefront</Link>
        </nav>
      </div>
    </header>

    <section className="product-admin-hero">
      <div>
        <p className="sys-kicker">PRODUCTS & ACCESS</p>
        <h1>Sell the outcome, not just one course.</h1>
        <p>Combine courses, community and live learning into bundles or recurring memberships. Free products can be joined immediately; paid checkout connects later.</p>
      </div>
      <dl>
        <div><dt>Products</dt><dd>{data.products.filter((product) => product.status !== "archived").length}</dd></div>
        <div><dt>Active access</dt><dd>{data.products.reduce((sum, product) => sum + Number(product.activeMembers || 0), 0)}</dd></div>
      </dl>
    </section>

    <section className="product-admin-grid">
      {message && <div className="notice product-admin-notice" role="status">{message}</div>}

      <form className="panel product-editor" onSubmit={saveProduct}>
        <div className="product-section-heading">
          <span>{editingId ? "EDIT" : "NEW"}</span>
          <div><h2>{editingId ? `Update ${selectedProduct?.name || "product"}` : "Create a product"}</h2><p>Choose what learners receive and for how long.</p></div>
        </div>
        <div className="product-form-grid">
          <label>Product name<input required minLength={2} maxLength={100} value={name} onChange={(event) => setName(event.target.value)} placeholder="Leadership accelerator" /></label>
          <label>Type<select value={productType} onChange={(event) => setProductType(event.target.value)}>
            <option value="bundle">Course bundle</option>
            <option value="membership">Membership</option>
            <option value="live_program">Live programme</option>
          </select></label>
          <label className="product-span-two">Description<textarea maxLength={1200} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What members will achieve and what is included." /></label>
          <label>Price in rand<input min={0} step="0.01" type="number" value={priceRand} onChange={(event) => setPriceRand(event.target.value)} /></label>
          <label>Billing<select value={billingInterval} onChange={(event) => setBillingInterval(event.target.value)} disabled={Number(priceRand) === 0}>
            <option value="one_time">One time</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select></label>
          <label>Access length (days)<input min={0} max={3650} type="number" value={durationDays} onChange={(event) => setDurationDays(event.target.value)} /><small>Use 0 for access without an expiry date.</small></label>
        </div>
        <fieldset className="product-course-picker">
          <legend>Included learning and support</legend>
          {data.courses.length ? data.courses.map((course) => <label key={course.id}>
            <input type="checkbox" checked={courseIds.includes(course.id)} onChange={() => toggleCourse(course.id)} />
            <span><b>{course.title}</b><small>{course.status}</small></span>
          </label>) : <p>No courses have been created for {data.school.name}. You can still make this a live programme or include its community.</p>}
          {data.community && <label>
            <input type="checkbox" checked={includesCommunity} onChange={(event) => setIncludesCommunity(event.target.checked)} />
            <span><b>Include this provider&apos;s community</b><small>{data.community.name} access is granted and revoked with the product.</small></span>
          </label>}
          <p className="product-scope-note">This product stays inside {data.school.name}. Use the service-provider menu above to build the offer under another academy.</p>
        </fieldset>
        <div className="product-form-actions">
          <button className="sys-primary" disabled={busy === "product"}>{busy === "product" ? "Saving..." : editingId ? "Save product" : "Create draft"}</button>
          {editingId && <button type="button" className="builder-preview" onClick={resetEditor}>Cancel editing</button>}
        </div>
      </form>

      <section className="product-list-section">
        <div className="product-section-heading"><span>CATALOGUE</span><div><h2>Your products</h2><p>Publish when the access package is ready.</p></div></div>
        <div className="product-card-grid">
          {data.products.length ? data.products.map((product) => <article className={`panel product-card product-${product.status}`} key={product.id}>
            <div className="product-card-top"><span>{productNames[product.productType] || product.productType}</span><b className={`status ${product.status}`}>{product.status}</b></div>
            <h3>{product.name}</h3>
            <p>{product.description || "Add a clear promise so learners understand the outcome."}</p>
            <ul>
              <li>{product.items.length} included {product.items.length === 1 ? "course" : "courses"}</li>
              {product.includesCommunity ? <li>Community included</li> : null}
              <li>{product.activeMembers || 0} active {product.activeMembers === 1 ? "member" : "members"}</li>
            </ul>
            <div className="product-card-price"><strong>{product.priceCents ? `R${(product.priceCents / 100).toLocaleString("en-ZA")}` : "Free"}</strong><span>{product.billingInterval === "monthly" ? "/ month" : product.billingInterval === "yearly" ? "/ year" : ""}</span></div>
            <div className="product-card-actions">
              <button onClick={() => editProduct(product)}>Configure</button>
              {product.status === "published"
                ? <button onClick={() => setProductStatus(product, "draft")} disabled={busy === product.id}>Unpublish</button>
                : product.status !== "archived" && <button className="sys-primary" onClick={() => setProductStatus(product, "published")} disabled={busy === product.id}>Publish</button>}
              {product.status !== "archived" && <button className="danger-text" onClick={() => setProductStatus(product, "archived")} disabled={busy === product.id}>Archive</button>}
            </div>
          </article>) : <article className="panel product-empty"><h3>No products yet</h3><p>Create a bundle, membership or live programme using the editor.</p></article>}
        </div>
      </section>

      <section className="panel product-grants">
        <div className="product-section-heading"><span>ACCESS</span><div><h2>Grant access directly</h2><p>Useful for invited clients, internal teams and paid orders handled outside NorthStarLabs.</p></div></div>
        <form onSubmit={grantAccess}>
          <label>Product<select required value={grantProductId} onChange={(event) => setGrantProductId(event.target.value)}>
            <option value="">Choose a product</option>
            {data.products.filter((product) => product.status !== "archived").map((product) => <option value={product.id} key={product.id}>{product.name}</option>)}
          </select></label>
          <label>Registered learner email<input required type="email" value={grantEmail} onChange={(event) => setGrantEmail(event.target.value)} placeholder="learner@example.com" /></label>
          <label>Optional expiry<input type="date" value={grantExpiry} onChange={(event) => setGrantExpiry(event.target.value)} /></label>
          <button className="sys-primary" disabled={busy === "grant" || !grantProductId}>{busy === "grant" ? "Granting..." : "Grant product access"}</button>
        </form>
        <div className="entitlement-list">
          {entitlements.length ? entitlements.map((entitlement) => <div key={entitlement.id}>
            <span><b>{entitlement.displayName}</b><small>{entitlement.email}</small></span>
            <span><b>{entitlement.productName}</b><small>{productNames[entitlement.productType]}</small></span>
            <span className={`status ${entitlement.status}`}>{entitlement.status}</span>
            <small>{entitlement.expiresAt ? `Until ${new Date(entitlement.expiresAt).toLocaleDateString("en-ZA")}` : "No expiry"}</small>
            {entitlement.status === "active" && <button className="danger-text" disabled={busy === entitlement.id} onClick={() => revokeAccess(entitlement)}>Revoke</button>}
          </div>) : <p className="product-empty-copy">No product access has been granted yet.</p>}
        </div>
      </section>
    </section>
  </main>;
}
