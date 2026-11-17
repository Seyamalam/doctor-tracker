import { Button } from "@ui-sdk/react/button";
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
} from "@ui-sdk/react/menu";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

const triggerClass =
  "rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-700";

const UserMenu = () => {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="h-9 w-24 animate-pulse rounded-md bg-gray-200 dark:bg-gray-800" />
    );
  }

  if (!session) {
    return (
      <Link href="/login">
        <Button className={triggerClass}>Sign In</Button>
      </Link>
    );
  }

  return (
    <Menu
      onAction={(value) => {
        if (value === "sign-out") {
          authClient.signOut({
            fetchOptions: {
              onSuccess: () => {
                router.push("/");
              },
            },
          });
        }
      }}
    >
      <MenuTrigger className={triggerClass}>{session.user.name}</MenuTrigger>
      <MenuContent className="rounded-md border border-gray-200 bg-white p-1 shadow-md dark:border-gray-800 dark:bg-gray-950">
        <MenuItem value="email">{session.user.email}</MenuItem>
        <MenuSeparator />
        <MenuItem className="text-red-600" value="sign-out">
          Sign Out
        </MenuItem>
      </MenuContent>
    </Menu>
  );
};

export default UserMenu;
