import { useAuth } from "../stores/authStore";

export function useFeature(key) {
  const user = useAuth((s) => s.user);
  const f = user?.features?.find?.((x) => x.key === key);
  if (!f) return { enabled: true, requires_kyc: false, label: key, disabled_message: null };
  return f;
}

export function useFeatures() {
  return useAuth((s) => s.user?.features || []);
}
