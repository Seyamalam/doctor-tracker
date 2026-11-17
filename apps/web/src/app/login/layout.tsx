import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
};

const LoginLayout = ({ children }: Readonly<{ children: React.ReactNode }>) =>
  children;

export default LoginLayout;
