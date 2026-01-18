import { BottomNav } from '@/components/layout';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-background">
      {children}
      <BottomNav />
    </div>
  );
}
