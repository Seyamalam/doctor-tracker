import { useForm } from "@tanstack/react-form";
import { Button } from "@ui-sdk/react/button";
import { Field, FieldLabel } from "@ui-sdk/react/field";
import { Input } from "@ui-sdk/react/input";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

import { authClient } from "@/lib/auth-client";

import Loader from "./loader";

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-900";

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
            toast.success("Sign up successful");
          },
        }
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Invalid email address"),
        name: z.string().min(2, "Name must be at least 2 characters"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-md p-6">
      <h1 className="mb-6 text-center text-3xl font-bold">Create Account</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <div>
          <form.Field name="name">
            {(field) => (
              <Field>
                <FieldLabel>Name</FieldLabel>
                <Input
                  className={inputClass}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onValueChange={(value) => field.handleChange(value)}
                  value={field.state.value}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-red-500">
                    {error?.message}
                  </p>
                ))}
              </Field>
            )}
          </form.Field>
        </div>

        <div>
          <form.Field name="email">
            {(field) => (
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input
                  className={inputClass}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onValueChange={(value) => field.handleChange(value)}
                  type="email"
                  value={field.state.value}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-red-500">
                    {error?.message}
                  </p>
                ))}
              </Field>
            )}
          </form.Field>
        </div>

        <div>
          <form.Field name="password">
            {(field) => (
              <Field>
                <FieldLabel>Password</FieldLabel>
                <Input
                  className={inputClass}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onValueChange={(value) => field.handleChange(value)}
                  type="password"
                  value={field.state.value}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-red-500">
                    {error?.message}
                  </p>
                ))}
              </Field>
            )}
          </form.Field>
        </div>

        <form.Subscribe
          selector={(state) => ({
            canSubmit: state.canSubmit,
            isSubmitting: state.isSubmitting,
          })}
        >
          {({ canSubmit, isSubmitting }) => (
            <Button
              className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
              disabled={!canSubmit || isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Submitting..." : "Sign Up"}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <div className="mt-4 text-center">
        <Button
          className="text-indigo-600 hover:text-indigo-800"
          onClick={onSwitchToSignIn}
        >
          Already have an account? Sign In
        </Button>
      </div>
    </div>
  );
};

export default SignUpForm;
