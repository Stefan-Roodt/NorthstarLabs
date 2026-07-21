"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "../../../lib/supabase-client";

type PaymentOrder = {
  itemName: string;
  amountCents: number;
  currency: string;
  billingInterval: string;
  status: string;
  continueUrl: string;
};

export default function PaymentCompletePage() {
  const [order, setOrder] = useState<PaymentOrder | null>(null);
  const [message, setMessage] = useState("Confirming your payment with PayFast…");

  useEffect(() => {
    const search = new URLSearchParams(location.search);
    const orderId = search.get("order");
    const wasCancelled = search.get("cancelled") === "1";
    if (!orderId) return;
    let stopped = false;
    let attempts = 0;
    async function check() {
      const supabase = getSupabaseBrowser();
      const session = (await supabase?.auth.getSession())?.data.session;
      if (!session) {
        location.href = `/login?next=${encodeURIComponent(location.pathname + location.search)}`;
        return;
      }
      const response = await fetch(`/api/payfast/orders/${encodeURIComponent(orderId!)}`, {
        headers: { authorization: `Bearer ${session.access_token}` },
      });
      if (!response.ok) {
        setMessage("We could not load this payment. Open My learning or contact support.");
        return;
      }
      const result = await response.json() as PaymentOrder;
      if (stopped) return;
      setOrder(result);
      if (result.status === "complete") {
        setMessage("Payment confirmed. Your access is ready.");
        return;
      }
      if (["failed", "past_due", "cancelled"].includes(result.status)) {
        setMessage(result.status === "cancelled"
          ? "The PayFast checkout or subscription was cancelled."
          : "PayFast did not complete the payment. No new charge or access was applied.");
        return;
      }
      if (wasCancelled) {
        setMessage("Checkout was cancelled. Nothing was charged.");
        return;
      }
      attempts += 1;
      if (attempts < 8) setTimeout(check, 2_000);
      else setMessage("PayFast is still confirming the payment. Refresh this page in a moment.");
    }
    check();
    return () => { stopped = true; };
  }, []);

  const complete = order?.status === "complete";
  const cancelled = order?.status === "cancelled" || message.startsWith("Checkout was cancelled");
  return <main className="payment-complete-page">
    <section>
      <Link href="/">✦ NORTHSTARLABS</Link>
      <p className="sys-kicker">SECURE PAYFAST CHECKOUT</p>
      <h1>{complete ? "You’re in." : cancelled ? "Checkout cancelled." : "Confirming payment."}</h1>
      <p>{message}</p>
      {order && <dl>
        <div><dt>Order</dt><dd>{order.itemName}</dd></div>
        <div><dt>Amount</dt><dd>R{(order.amountCents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</dd></div>
        <div><dt>Status</dt><dd>{order.status.replaceAll("_", " ")}</dd></div>
      </dl>}
      <div>
        {complete && order
          ? <Link className="sys-primary" href={order.continueUrl}>Open your access →</Link>
          : <Link className="sys-primary" href="/learn">Go to My learning →</Link>}
        <Link href="/account">View account</Link>
      </div>
      <small>Access is granted only after NorthstarLabs verifies the PayFast notification, amount and signature.</small>
    </section>
  </main>;
}
