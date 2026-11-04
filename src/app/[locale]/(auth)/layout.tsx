import AuthShell from "@/ui/layout/AuthShell";

export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  return <AuthShell>{children}</AuthShell>;
}
