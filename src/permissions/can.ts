import { ROLE_PERMISSIONS } from "./roles";

type Role =
    | "SUPER_ADMIN"
    | "OWNER"
    | "SUPERVISOR";

export function can(
    role: Role,
    permission: string
) {
    return ROLE_PERMISSIONS[role]?.includes(
        permission as never
    );
}