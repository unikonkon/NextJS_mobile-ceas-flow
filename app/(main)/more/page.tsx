'use client';

import { Header, PageContainer } from '@/components/layout';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronRight, Crown } from 'lucide-react';
import Link from 'next/link';

const menuSections = [
  {
    title: 'จัดการข้อมูล',
    items: [
      { icon: '📁', label: 'หมวดหมู่', href: '/more/categories' },
      { icon: '💰', label: 'งบประมาณ', href: '/more/budgets' },
      { icon: '🎯', label: 'เป้าหมายการออม', href: '/more/goals' },
      { icon: '🔄', label: 'บิลประจำงวด', href: '/more/recurring' },
      { icon: '🔔', label: 'เตือนความจำ', href: '/more/reminders' },
    ],
  },
  {
    title: 'หนังสือและสมาชิก',
    items: [
      { icon: '📒', label: 'จัดการหนังสือ', href: '/more/books' },
      { icon: '👥', label: 'สมาชิก', href: '/more/members' },
    ],
  },
  {
    title: 'เครื่องมือ',
    items: [
      { icon: '💱', label: 'แลกเปลี่ยนเงินตรา', href: '/more/currency' },
      { icon: '📊', label: 'ส่งออก Excel', href: '/more/export' },
      { icon: '🔍', label: 'ค้นหา', href: '/more/search' },
      { icon: '☁️', label: 'สำรองข้อมูล', href: '/more/backup' },
    ],
  },
  {
    title: 'อื่นๆ',
    items: [
      { icon: '⚙️', label: 'ตั้งค่า', href: '/more/settings' },
      { icon: '❓', label: 'ช่วยเหลือ', href: '/more/help' },
      { icon: '📝', label: 'ข้อเสนอแนะ', href: '/more/feedback' },
    ],
  },
];

export default function MorePage() {
  return (
    <>
      <Header title="เพิ่มเติม" />

      <PageContainer className="pt-4 space-y-6">
        {/* User Profile Card */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarImage src="/avatar.jpg" alt="User" />
              <AvatarFallback className="bg-primary/10 text-2xl">
                🧑
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">ผู้ใช้งาน</h2>
              <p className="text-sm text-muted-foreground">user@email.com</p>
            </div>
            <ChevronRight className="size-5 text-muted-foreground" />
          </div>
        </Card>

        {/* Premium Banner */}
        <Card className="relative overflow-hidden bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 p-4">
          <div className="absolute -right-4 -top-4 size-24 rounded-full bg-amber-400/20 blur-2xl" />
          <div className="absolute -bottom-4 -left-4 size-20 rounded-full bg-rose-400/20 blur-xl" />

          <div className="relative flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
              <Crown className="size-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">อัพเกรดเป็น Premium</h3>
              <p className="text-xs text-muted-foreground">
                ปลดล็อคฟีเจอร์เต็มรูปแบบ ไม่มีโฆษณา
              </p>
            </div>
            <ChevronRight className="size-5 text-muted-foreground" />
          </div>
        </Card>

        {/* Menu Sections */}
        {menuSections.map((section) => (
          <div key={section.title}>
            <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {section.title}
            </h3>
            <Card className="divide-y divide-border">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 p-3 transition-colors hover:bg-accent/50"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="flex-1 font-medium">{item.label}</span>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>
              ))}
            </Card>
          </div>
        ))}

        {/* Version Info */}
        <p className="pb-4 text-center text-xs text-muted-foreground">
          เวอร์ชัน 1.0.0
        </p>
      </PageContainer>
    </>
  );
}
