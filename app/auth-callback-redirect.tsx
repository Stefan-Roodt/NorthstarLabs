"use client";

import { useEffect } from "react";
import { getSupabaseBrowser } from "../lib/supabase-client";

const destinationKey = "northstar:post-auth-destination";

function safeDestination(value: string | null) {
  if (!value?.startsWith("/") || value.startsWith("//")) return "/welcome";
  try {
    const url = new URL(value, location.origin);
    return url.origin === location.origin ? `${url.pathname}${url.search}${url.hash}` : "/welcome";
  } catch {
    return "/welcome";
  }
}

export function AuthCallbackRedirect() {
  useEffect(() => {
    const isOAuthReturn = location.hash.includes("access_token=") || location.hash.includes("error_description=");
    if (!isOAuthReturn) return;

    const supabase = getSupabaseBrowser();
    const destination = safeDestination(sessionStorage.getItem(destinationKey));
    const clearSensitiveFragment = () => history.replaceState(null, "", `${location.pathname}${location.search}`);
    if (!supabase) {
      clearSensitiveFragment();
      return;
    }

    let redirected = false;
    const finish = () => {
      if (redirected) return;
      redirected = true;
      sessionStorage.removeItem(destinationKey);
      clearSensitiveFragment();
      location.replace(destination);
    };

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) finish();
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) finish();
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  return null;
}
