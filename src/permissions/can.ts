import { ROLE_PERMISSIONS } from "./roles";

type Role =
    | "SUPER_ADMIN"
    | "VENUE_OWNER"
    | "MANAGER"
    | "STAFF"
    | "CUSTOMER";

export function can(
    role: Role,
    permission: string
) {
    return ROLE_PERMISSIONS[role]?.includes(
        permission as never
    );
}