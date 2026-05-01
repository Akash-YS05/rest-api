"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient, tokenStore } from "@/lib/api-client";
import type { User } from "@/types/api";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const result = await apiClient.get<User | null>("/api/v1/auth/me");
      if (!result.success || !result.data) {
        tokenStore.clear();
        router.replace("/");
        return;
      }
      setUser(result.data);
      setLoading(false);
    };
    void init();
  }, [router]);

  const onLogout = async () => {
    await apiClient.post("/api/v1/auth/logout", {});
    tokenStore.clear();
    router.replace("/");
  };

  if (loading) {
    return (
      <main className="arch-grid flex min-h-screen items-center justify-center">
        <div className="font-mono text-sm animate-pulse uppercase tracking-[0.3em] font-black">Loading Secure Dossier</div>
      </main>
    );
  }

  return (
    <main className="arch-grid min-h-screen p-6 md:p-12 lg:p-10">
      <div className="max-w-4xl mx-auto">
        <header className="mb-16 border-b-4 border-[#1A1C20] pb-4">
          <span className="font-mono text-xs uppercase tracking-[0.4em] text-[#D25A46] block mb-4 font-black">Access Level: {user?.role}</span>
          <h1 className="text-4xl md:text-6xl font-black font-semibold tracking-[-0.08em] uppercase leading-none">User Dossier</h1>
        </header>

        <div className="grid gap-12 md:grid-cols-12">
          {/* Identity Info */}
          <div className="md:col-span-7 arch-box arch-shadow p-12 bg-white">
            <div className="flex flex-col md:flex-row gap-10 items-center md:items-start mb-12">
              <div className="w-40 h-40 border-4 border-[#1A1C20] flex items-center justify-center text-6xl font-black bg-[#D25A46] text-white">
                {user?.name[0]}
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-black mb-3 font-semibold uppercase tracking-tighter">{user?.name}</h2>
                <p className="font-mono text-sm font-bold opacity-60 uppercase">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-10 border-t-2 border-[#1A1C20] pt-10">
              <div>
                <span className="font-mono text-[10px] uppercase opacity-40 block mb-2 font-black">System UID</span>
                <p className="font-mono text-xs font-black truncate">{user?.id}</p>
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase opacity-40 block mb-2 font-black">Authorization</span>
                <p className="font-mono text-xs font-black uppercase">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="md:col-span-5 space-y-8">
            <div className="section-marker uppercase tracking-widest">Protocols</div>
            <div className="arch-box arch-shadow p-10 space-y-4">
              <Link href="/" className="arch-button w-full font-black">Return To Workspace</Link>
              <Link href="/docs" className="arch-button w-full font-black">View API Reference</Link>
              <button onClick={onLogout} className="arch-button arch-button-primary w-full font-black">Sign Out</button>
            </div>
            
            <div className="p-8 border-4 border-dashed border-[#1A1C20]/10 font-mono text-[10px] uppercase leading-relaxed text-center opacity-40 font-bold">
              All operational changes are logged against your unique system ID. Unauthorized access attempts will be flagged.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
