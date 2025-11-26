"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export type User = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  email_verified: boolean;
  verified_at: string | null;
  created_at: string;
  student_id: string | null;
};

type UseAuthResult = {
  user: User | null | undefined;
  loading: boolean;
  shouldOpenSignInFromQuery: boolean;
  clearShouldOpenSignInFromQuery: () => void;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
};

export function useAuth(): UseAuthResult {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [shouldOpenSignInFromQuery, setShouldOpenSignInFromQuery] = useState(false);
  const [checkedQueryOnce, setCheckedQueryOnce] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await res.json();
        setUser(data.user || null);
      } catch (e) {
        setUser(null);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    if (user === undefined) return;
    if (checkedQueryOnce) return;

    const shouldShowSignIn = searchParams.get("showSignIn");
    if (!user && shouldShowSignIn === "true") {
      setShouldOpenSignInFromQuery(true);
    }

    setCheckedQueryOnce(true);
  }, [searchParams, user, checkedQueryOnce]);

  const clearShouldOpenSignInFromQuery = () => {
    setShouldOpenSignInFromQuery(false);
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/signout", {
        method: "POST",
      });
      setUser(null);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return {
    user,
    loading: user === undefined,
    shouldOpenSignInFromQuery,
    clearShouldOpenSignInFromQuery,
    setUser,
    logout,
  };
}
