import { ReactNode } from "react";

import { useAuthStore } from "@/store/auth-store";

import { can } from "@/permissions/can";

interface Props {
  permission: string;
  children: ReactNode;
}

export const PermissionGuard = ({
  permission,
  children,
}: Props) => {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  const allowed = can(
    user.role,
    permission
  );

  if (!allowed) {
    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold">
          Access Denied
        </h1>
      </div>
    );
  }

  return <>{children}</>;
};