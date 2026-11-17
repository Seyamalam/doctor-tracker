"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { authClient } from "@/lib/auth-client";

const Dashboard = ({
  session,
}: {
  session: typeof authClient.$Infer.Session;
}) => {
  const privateData = useQuery({ queryFn: api.me, queryKey: ["me"] });

  return (
    <p>
      API: {privateData.data?.message} — signed in as {session.user.name}
    </p>
  );
};

export default Dashboard;
