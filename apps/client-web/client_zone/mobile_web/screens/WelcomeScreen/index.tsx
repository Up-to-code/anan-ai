"use client";

import Link from "next/link";
import { AnanMark, MobileButton, MobileViewport } from "../../components/ui";

/**
 * WHY:   The client web entry point should now match the branded welcome screen used in the mobile buyer app.
 * WHAT:  Renders the mobile-style welcome surface with the same headline, body copy, and two entry CTAs.
 * HOW:   Keeps the layout centered inside the shared mobile viewport and routes users into the assistant or search flow.
 */
export default function WelcomeScreen() {
  return (
    <MobileViewport className="justify-center px-8">
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-[400px] text-center">
          <div className="mb-8 inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 dark:border-slate-800 dark:bg-slate-900">
            <span className="text-[12px] font-black tracking-[3px] text-slate-500 dark:text-slate-400">BUYER ASSISTANT</span>
          </div>

          <div className="mx-auto mb-12 flex h-[124px] w-[124px] items-center justify-center rounded-[40px] border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <AnanMark />
          </div>

          <h1 className="mb-4 text-[32px] leading-[44px] font-black text-slate-900 dark:text-slate-50">مرحباً بك في عنان</h1>
          <p className="mb-8 px-4 text-[16px] leading-8 font-medium text-slate-500 dark:text-slate-400">
            مساعدك العقاري الذكي بين يديك. ابحث، قارن، راجع التمويل، واطلب مستشاراً من نفس التجربة.
          </p>

          <div className="mb-8 rounded-[28px] border border-slate-200 bg-white px-5 py-5 text-right dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-[15px] font-black text-slate-900 dark:text-slate-50">البداية الأسرع</h2>
            <p className="mt-2 text-[14px] leading-7 text-slate-500 dark:text-slate-400">
              افتح المحادثة الرئيسية إذا كنت تعرف ما تريد، أو ابدأ من البحث إذا كنت تفضل تصفح الخيارات أولاً.
            </p>
          </div>

          <div className="space-y-3">
            <MobileButton label="ابدأ مع المساعد" href="/app" className="w-full" />
            <MobileButton label="تصفح البحث أولاً" href="/search" variant="secondary" className="w-full" />
          </div>

          <Link href="/app" aria-label="افتح المساعد" className="sr-only">
            افتح المساعد
          </Link>
        </div>
      </div>
    </MobileViewport>
  );
}
