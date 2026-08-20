import { useEffect, useRef } from "react";

type GoogleCredential = { credential: string };
type GoogleAccounts = { id: { initialize: (options: { client_id: string; callback: (response: GoogleCredential) => void }) => void; renderButton: (element: HTMLElement, options: Record<string, string | number>) => void } };
declare global { interface Window { google?: { accounts: GoogleAccounts } } }

export default function GoogleSignIn({ onCredential }: { onCredential: (credential: string) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const credentialHandler = useRef(onCredential);
  const initializedClientId = useRef("");
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  useEffect(() => { credentialHandler.current = onCredential; }, [onCredential]);
  useEffect(() => {
    if (!clientId || !container.current) return;
    const render = () => {
      if (!window.google || !container.current) return;
      if (initializedClientId.current !== clientId) {
        window.google.accounts.id.initialize({ client_id: clientId, callback: (response) => credentialHandler.current(response.credential) });
        initializedClientId.current = clientId;
      }
      container.current.replaceChildren();
      window.google.accounts.id.renderButton(container.current, { type: "standard", theme: "outline", size: "large", shape: "pill", text: "continue_with", logo_alignment: "left", width: 400 });
    };
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) { if (window.google) render(); else existing.addEventListener("load", render, { once: true }); return; }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.addEventListener("load", render, { once: true });
    document.head.appendChild(script);
  }, [clientId]);
  if (!clientId) return <div className="flex h-11 items-center justify-center rounded-full border border-dashed border-slate-300 bg-slate-50 px-4 text-xs text-slate-500">Add your Google Client ID to enable Google sign-in</div>;
  return <div ref={container} className="flex min-h-11 w-full justify-center overflow-hidden rounded-full" />;
}
