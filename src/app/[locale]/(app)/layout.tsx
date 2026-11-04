import AppShell from "@/ui/layout/AppShell";
import MiniPlayerProvider from "@/ui/components/MiniPlayer";
import NotesPanel from "@/ui/components/NotesPanel";
import IngriChat from "@/ui/components/IngriChat";
import YouTubeBridge from "@/ui/components/YouTubeBridge";
import Celebration from "@/ui/components/Celebration";

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <MiniPlayerProvider>
      <AppShell>{children}</AppShell>
      <NotesPanel />
      <IngriChat />
      <YouTubeBridge />
      <Celebration />
    </MiniPlayerProvider>
  );
}