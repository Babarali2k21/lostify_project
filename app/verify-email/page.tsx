"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { VerifyEmailSuccessDialog } from "../../components/dialogs/VerifyEmailSuccessDialog";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-600">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
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
        <p className="text-gray-600">Invalid or missing verification token.</p>
      </div>
    );
  }

  return (
    <VerifyEmailSuccessDialog
      open={open}
      token={token}
      onDone={handleDone}
    />
  );
}
