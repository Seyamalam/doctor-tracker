"use client";

import { useForm } from "@tanstack/react-form";
import { Button } from "@ui-sdk/react/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

import { TextField } from "@/components/form-fields";
import { btn, cx, Skeleton } from "@/components/ui";
import { authClient } from "@/lib/auth-client";

const signUpSchema = z.object({
  email: z.email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const SignUpForm = ({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) => {
  const router = useRouter();
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: {
      email: "",
      name: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          email: value.email,
          name: value.name,
          password: value.password,
        },
        {
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
          onSuccess: () => {
            router.push("/dashboard");
            toast.success("Account created");
          },
        }
      );
    },
    validators: {
      onSubmit: signUpSchema,
    },
  });

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-14 w-full" />
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
        name="name"
        validators={{ onChange: signUpSchema.shape.name }}
      >
        {(field) => (
          <TextField autoComplete="name" field={field} label="Name" />
        )}
      </form.Field>
      <form.Field
        name="email"
        validators={{ onChange: signUpSchema.shape.email }}
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
        validators={{ onChange: signUpSchema.shape.password }}
      >
        {(field) => (
          <TextField
            autoComplete="new-password"
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
            {isSubmitting ? "Creating account…" : "Sign Up"}
          </Button>
        )}
      </form.Subscribe>
      <p className="text-muted-foreground text-center text-[13px]">
        <button
          className="text-primary focus-visible:outline-ring rounded font-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={onSwitchToSignIn}
          type="button"
        >
          Already have an account? Sign in
        </button>
      </p>
    </form>
  );
};

export default SignUpForm;
