import { useAuth } from "../stores/authStore";

export function useCan(permission) {
  const user = useAuth((s) => s.user);
  if (!user) return false;
  if (user.is_admin) return true;
  return Array.isArray(user.permissions) && user.permissions.includes(permission);
}

export function useCanAny(permissions = []) {
  const user = useAuth((s) => s.user);
  if (!user) return false;
  if (user.is_admin) return true;
  if (!Array.isArray(user.permissions)) return false;
  return permissions.some((p) => user.permissions.includes(p));
}

export function useIsStaff() {
  const user = useAuth((s) => s.user);
  return !!(user?.is_staff || user?.is_admin);
}
