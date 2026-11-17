"use client";

import { useState } from "react";

import { Logo } from "@/components/logo";
import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

const LoginPage = () => {
  const [showSignIn, setShowSignIn] = useState(true);

  return (
    <div className="bg-[radial-gradient(60rem_40rem_at_50%_-10%,var(--color-primary)/8%,transparent)] flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="anim-enter w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <Logo className="h-9 w-9" />
          <h1 className="text-lg font-semibold">Doctor Tracker</h1>
          <p className="text-muted-foreground text-[13px]">
            {showSignIn ? "Sign in to your admin account" : "Create an admin account"}
          </p>
        </div>
        <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
          {showSignIn ? (
            <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
          ) : (
            <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
