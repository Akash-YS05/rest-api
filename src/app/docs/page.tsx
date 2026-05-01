"use client";

import { useEffect } from "react";
import "swagger-ui-dist/swagger-ui.css";
import Link from "next/link";

export default function DocsPage() {
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const [{ default: SwaggerUIBundle }, SwaggerUIStandalonePresetModule] = await Promise.all([
        import("swagger-ui-dist/swagger-ui-es-bundle"),
        import("swagger-ui-dist/swagger-ui-standalone-preset"),
      ]);

      if (!mounted) return;

      SwaggerUIBundle({
        url: "/api/v1/docs/openapi",
        dom_id: "#swagger-ui",
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePresetModule.default],
        layout: "StandaloneLayout",
      });
    };

    void init();
    return () => { mounted = false; };
  }, []);

  return (
    <main className="arch-grid min-h-screen p-6 md:p-12 lg:p-10">
      <header className="mb-16 border-b-4 border-[#1A1C20] pb-4 flex flex-col md:flex-row justify-between items-end gap-8">
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.4em] text-[#D25A46] block mb-4 font-black">Reference Documentation</span>
          <h1 className="text-3xl md:text-6xl font-black font-semibold tracking-[-0.08em] uppercase leading-none">API Spec</h1>
        </div>
        <div className="flex gap-6">
          <Link href="/" className="arch-button font-black">Workspace</Link>
          <a
            href="/api/v1/docs/openapi"
            target="_blank"
            className="arch-button arch-button-primary font-black"
          >
            Raw JSON
          </a>
        </div>
      </header>

      <div className="arch-box arch-shadow bg-white overflow-hidden">
        <div className="bg-[#1A1C20] text-white px-8 py-3 text-xs font-mono flex justify-between uppercase font-black tracking-widest">
          <span>Module: API v1</span>
          <span>Status: Verified</span>
        </div>
        <div id="swagger-ui" className="p-4 md:p-12" />
      </div>

      <footer className="mt-20 p-10 border-4 border-dashed border-[#1A1C20]/10 font-mono text-xs uppercase text-center opacity-40 font-bold tracking-widest">
        Official REST API documentation. Use with caution in production environments.
      </footer>
    </main>
  );
}
