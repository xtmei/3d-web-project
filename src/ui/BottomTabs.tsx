import { useAppStore } from '@/app/store';
export function BottomTabs() {
  const { mobileTab, setMobileTab } = useAppStore();
  return <nav className="md:hidden h-10 border-t border-[var(--line0)] bg-[var(--bg1)] grid grid-cols-3 text-xs">{(['oob','map','details'] as const).map(t => <button key={t} className={mobileTab===t?'bg-[var(--bg2)]':''} onClick={()=>setMobileTab(t)}>{t.toUpperCase()}</button>)}</nav>;
}
