import { env } from "cloudflare:workers";
import { isPayfastPlan, parameterString, payfastPlans, payfastSignature } from "../../../../lib/payfast";

export async function POST(request: Request) {
  const raw = await request.text();
  const data = new URLSearchParams(raw);
  const merchantId = process.env.PAYFAST_MERCHANT_ID;
  const passphrase = process.env.PAYFAST_PASSPHRASE;
  const sandbox = process.env.PAYFAST_SANDBOX !== "false";
  if (!merchantId || !passphrase || data.get("merchant_id") !== merchantId) return new Response("Invalid merchant", { status: 400 });
  const expectedSignature = payfastSignature(data.entries(), passphrase);
  if (data.get("signature") !== expectedSignature) return new Response("Invalid signature", { status: 400 });

  const validationBody = parameterString(data.entries());
  const validationUrl = sandbox ? "https://sandbox.payfast.co.za/eng/query/validate" : "https://www.payfast.co.za/eng/query/validate";
  const validation = await fetch(validationUrl, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: validationBody });
  if ((await validation.text()).trim() !== "VALID") return new Response("Invalid transaction", { status: 400 });

  const userId = data.get("custom_str1");
  const plan = data.get("custom_str2");
  if (!userId || !isPayfastPlan(plan)) return new Response("Invalid subscription", { status: 400 });
  const expectedAmount = Number(process.env[payfastPlans[plan].amountEnv]);
  const receivedAmount = Number(data.get("amount_gross"));
  if (!Number.isFinite(expectedAmount) || Math.abs(expectedAmount - receivedAmount) > 0.01) return new Response("Amount mismatch", { status: 400 });

  const paymentId = data.get("pf_payment_id");
  const token = data.get("token");
  const complete = data.get("payment_status") === "COMPLETE";
  const existing = token ? await env.DB.prepare("SELECT id FROM memberships WHERE payfast_token = ?").bind(token).first<{ id: string }>() : null;
  if (existing) {
    await env.DB.prepare("UPDATE memberships SET status = ?, plan = ?, payfast_payment_id = ? WHERE id = ?")
      .bind(complete ? "active" : "pending", plan, paymentId, existing.id).run();
  } else {
    await env.DB.prepare("INSERT INTO memberships (id,user_id,payfast_token,payfast_payment_id,provider,plan,status,created_at) VALUES (?,?,?,?,?,?,?,?)")
      .bind(crypto.randomUUID(), userId, token, paymentId, "payfast", plan, complete ? "active" : "pending", Date.now()).run();
  }
  return new Response("OK");
}
