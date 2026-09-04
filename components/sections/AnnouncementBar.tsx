import { copy } from '@/content/copy';

export function AnnouncementBar() {
  return (
    <div className="bg-cta px-4 py-[10px] text-center text-[12px] font-extrabold tracking-[0.02em] text-white lg:text-[14px]">
      <span className="lg:hidden">{copy.announcement.mobile}</span>
      <span className="hidden lg:inline">{copy.announcement.desktop.split(' · ').join(' · ')}</span>
    </div>
  );
}
