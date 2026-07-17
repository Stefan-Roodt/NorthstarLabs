import { requireApiUser } from "../../../../lib/server-auth";
import { isPayfastPlan, payfastPlans, payfastSignature } from "../../../../lib/payfast";

export async function POST(request: Request) {
  const user = await requireApiUser(request);
  if (!user?.email) return Response.json({ error: "Sign in before checkout" }, { status: 401 });
  const body = await request.json() as { plan?: string };
  if (!isPayfastPlan(body.plan)) return Response.json({ error: "Choose a valid Northstar plan" }, { status: 400 });
  const merchantId = process.env.PAYFAST_MERCHANT_ID;
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
  const passphrase = process.env.PAYFAST_PASSPHRASE;
  const plan = payfastPlans[body.plan];
  const amount = Number(process.env[plan.amountEnv]);
  if (!merchantId || !merchantKey || !passphrase || !Number.isFinite(amount) || amount < 5) {
    return Response.json({ error: "PayFast sandbox settings are not connected yet" }, { status: 503 });
  }
  const origin = new URL(request.url).origin;
  const name = String(user.user_metadata?.full_name || user.user_metadata?.name || "Northstar creator").trim().split(/\s+/);
  const fields: Record<string, string> = {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    return_url: `${origin}/dashboard?payment=success`,
    cancel_url: `${origin}/dashboard?payment=cancelled`,
    notify_url: `${origin}/api/payfast/itn`,
    name_first: name[0] || "Northstar",
    name_last: name.slice(1).join(" ") || "Creator",
    email_address: user.email,
    m_payment_id: crypto.randomUUID(),
    amount: amount.toFixed(2),
    item_name: plan.name,
    item_description: `${plan.name} monthly platform subscription`,
    custom_str1: user.id,
    custom_str2: body.plan,
    subscription_type: "1",
    recurring_amount: amount.toFixed(2),
    frequency: "3",
    cycles: "0",
  };
  fields.signature = payfastSignature(Object.entries(fields), passphrase);
  const sandbox = process.env.PAYFAST_SANDBOX !== "false";
  return Response.json({
    action: sandbox ? "https://sandbox.payfast.co.za/eng/process" : "https://www.payfast.co.za/eng/process",
    fields,
  });
}
