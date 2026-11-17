"use client";

import { useForm } from "@tanstack/react-form";
import { Button } from "@ui-sdk/react/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

import { TextField } from "@/components/form-fields";
import { btn, cx, Skeleton } from "@/components/ui";
import { authClient } from "@/lib/auth-client";

const signInSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const SignInForm = ({ onSwitchToSignUp }: { onSwitchToSignUp: () => void }) => {
  const router = useRouter();
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
        },
        {
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
          onSuccess: () => {
            router.push("/dashboard");
            toast.success("Welcome back");
          },
        }
      );
    },
    validators: {
      onSubmit: signInSchema,
    },
  });

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.Field
        name="email"
        validators={{ onChange: signInSchema.shape.email }}
      >
        {(field) => (
          <TextField
            autoComplete="email"
            field={field}
            label="Email"
            spellCheck={false}
            type="email"
          />
        )}
      </form.Field>
      <form.Field
        name="password"
        validators={{ onChange: signInSchema.shape.password }}
      >
        {(field) => (
          <TextField
            autoComplete="current-password"
            field={field}
            label="Password"
            type="password"
          />
        )}
      </form.Field>
      <form.Subscribe
        selector={(state) => ({
          canSubmit: state.canSubmit,
          isSubmitting: state.isSubmitting,
        })}
      >
        {({ canSubmit, isSubmitting }) => (
          <Button
            className={cx(btn.primary, "w-full")}
            disabled={!canSubmit || isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Signing in…" : "Sign In"}
          </Button>
        )}
      </form.Subscribe>
      <p className="text-muted-foreground text-center text-[13px]">
        <button
          className="text-primary focus-visible:outline-ring rounded font-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={onSwitchToSignUp}
          type="button"
        >
          Need an account? Sign up
        </button>
      </p>
    </form>
  );
};

export default SignInForm;
