"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { ResetPasswordDialog } from "../../components/dialogs/ResetPasswordDialog";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-600">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (token) setOpen(true);
  }, [token]);

  const handleDone = () => {
    setOpen(false);
    router.replace("/?showSignIn=true");
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Invalid or missing reset token.</p>
      </div>
    );
  }

  return (
    <ResetPasswordDialog
      open={open}
      token={token}
      onDone={handleDone}
    />
  );
}
