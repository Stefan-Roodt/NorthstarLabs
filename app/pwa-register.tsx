"use client";

import { useEffect, useState } from "react";

type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaRegister() {
  const [installPrompt, setInstallPrompt] = useState<InstallPrompt | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let refreshing = false;
    const refreshForUpdate = () => {
      if (refreshing || !navigator.serviceWorker.controller) return;
      refreshing = true;
      location.reload();
    };
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", refreshForUpdate);
      navigator.serviceWorker.register("/sw.js")
        .then((registration) => registration.update())
        .catch(() => undefined);
    }
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    if (standalone) return;
    const capture = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPrompt);
      setVisible(true);
    };
    const installed = () => {
      setVisible(false);
      setInstallPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", capture);
    window.addEventListener("appinstalled", installed);
    return () => {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("controllerchange", refreshForUpdate);
      }
      window.removeEventListener("beforeinstallprompt", capture);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);

  async function install() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
    setVisible(false);
  }

  if (!visible) return null;
  return <button className="pwa-install" onClick={install} aria-label="Install NorthStarLabs on this device">
    <span>+</span>
    <b>Install app</b>
  </button>;
}
