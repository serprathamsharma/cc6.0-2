type UserRole = "admin" | "field_officer" | "reviewer" | "viewer";

export interface AppUser {
  id: string;
  clerkId: string | null;
  orgId: string;
  orgSlug: string;
  role: UserRole;
  name: string;
  email: string;
}

const DEMO_ORG_ID = "00000000-0000-0000-0000-000000000001";
const DEMO_USER_ID = "00000000-0000-0000-0000-000000000002";

const MOCK_USER: AppUser = {
  id: DEMO_USER_ID,
  clerkId: null,
  orgId: DEMO_ORG_ID,
  orgSlug: "demo-org",
  role: "admin",
  name: "Demo Admin",
  email: "admin@impactlens.demo",
};

const CLERK_AVAILABLE =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !!process.env.CLERK_SECRET_KEY;

/**
 * Get the current authenticated user.
 * Falls back to a mock admin user when Clerk is not configured.
 */
export async function getCurrentUser(): Promise<AppUser> {
  if (!CLERK_AVAILABLE) {
    return MOCK_USER;
  }

  // When Clerk is configured, use its auth
  try {
    const { auth } = await import("@clerk/nextjs/server");
    const session = await auth();

    if (!session?.userId) {
      throw new Error("Not authenticated");
    }

    // In a real app, look up user from DB by clerk_id
    // For now, return mock with clerk info
    return {
      ...MOCK_USER,
      clerkId: session.userId,
    };
  } catch {
    return MOCK_USER;
  }
}

/**
 * Check if the current user has one of the required roles.
 */
export async function requireRole(...roles: UserRole[]): Promise<AppUser> {
  const user = await getCurrentUser();
  if (!roles.includes(user.role)) {
    throw new Error(
      `Unauthorized: requires one of [${roles.join(", ")}], has [${user.role}]`
    );
  }
  return user;
}

export { CLERK_AVAILABLE, DEMO_ORG_ID, DEMO_USER_ID };
