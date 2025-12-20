"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import useAuth from "@/store/auth";
import { useToast } from "@/components/ToastProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { token, exp, logout } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    if (exp && exp * 1000 < Date.now()) {
      logout();
      addToast("Session expired. Please log in again.", "error");
      router.push("/login");
      return;
    }

    // noAccess from middleware (без useSearchParams)
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const noAccess = sp.get("noAccess");
      if (noAccess) {
        addToast("No access.", "error");
        sp.delete("noAccess");
        const nextSearch = sp.toString();
        router.replace(
          nextSearch ? `${window.location.pathname}?${nextSearch}` : window.location.pathname
        );
      }
    }
  }, [token, exp, logout, router, addToast]);

  return (
    <ErrorBoundary>
      <AppShell>{children}</AppShell>
    </ErrorBoundary>
  );
}
