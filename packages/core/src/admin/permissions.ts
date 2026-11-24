export type Role = "OWNER" | "MANAGER" | "CONTENT";
export type Perm =
  | "leads"
  | "drafts"
  | "pros"
  | "catalog"
  | "cities"
  | "cities.toggle"
  | "seo"
  | "redirects"
  | "blogs"
  | "media"
  | "settings"
  | "users";

/** Role matrix. Enforced in the admin layout AND re-checked inside every server action. */
const ALL: Role[] = ["OWNER", "MANAGER", "CONTENT"];
const MATRIX: Record<Perm, Role[]> = {
  leads: ["OWNER", "MANAGER"],
  drafts: ALL,
  pros: ["OWNER", "MANAGER"],
  catalog: ["OWNER", "MANAGER"],
  cities: ["OWNER", "MANAGER"],
  "cities.toggle": ["OWNER"], // launching or pausing a city is an owner decision
  seo: ["OWNER", "MANAGER"],
  redirects: ["OWNER", "MANAGER"],
  blogs: ALL,
  media: ALL,
  settings: ["OWNER"],
  users: ["OWNER"],
};
export const can = (role: Role | undefined | null, perm: Perm) =>
  !!role && MATRIX[perm].includes(role);
