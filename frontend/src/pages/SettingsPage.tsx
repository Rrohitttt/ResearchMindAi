import { useAuthStore } from "@/store/auth";
import { PageHeader, Card } from "@/components/ui/primitives";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <PageHeader title="Settings" description="Your account details." />
      <Card className="p-6 max-w-md">
        <div className="mb-4">
          <p className="text-xs text-ink-400 uppercase font-medium tracking-wide mb-1">Full name</p>
          <p className="text-sm text-ink-900">{user?.full_name}</p>
        </div>
        <div>
          <p className="text-xs text-ink-400 uppercase font-medium tracking-wide mb-1">Email</p>
          <p className="text-sm text-ink-900">{user?.email}</p>
        </div>
      </Card>
    </div>
  );
}
