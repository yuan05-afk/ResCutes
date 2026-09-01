import { MobileNav } from "@/components/layout/mobile-nav";

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bone md:bg-[#e8e6df]">
      <div className="mx-auto min-h-screen max-w-mobile w-full bg-bone shadow-elevated md:my-4 md:min-h-[calc(100vh-2rem)] md:rounded-2xl md:border md:border-sage/20 overflow-hidden relative pb-20">
        {children}
        <MobileNav />
      </div>
    </div>
  );
}
