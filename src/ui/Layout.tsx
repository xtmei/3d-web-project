import React from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { CommandBar } from './CommandBar';
import { StatusBar } from './StatusBar';
import { OobTree } from './OobTree';
import { UnitDetails } from './UnitDetails';
import { MapScene } from '@/viz/MapScene';
import { BottomTabs } from './BottomTabs';
import { useAppStore } from '@/app/store';

export function Layout() {
  const mobileTab = useAppStore((s) => s.mobileTab);
  useKeyboardShortcuts();
  return <div className="app-shell"><CommandBar /><main className="flex-1 min-h-0 hidden md:block"><PanelGroup direction="horizontal"><Panel defaultSize={22} minSize={16}><Section title="Order of Battle"><OobTree /></Section></Panel><PanelResizeHandle className="w-1 bg-[var(--line0)]" /><Panel minSize={35}><Section title="Operational Map"><MapScene /></Section></Panel><PanelResizeHandle className="w-1 bg-[var(--line0)]" /><Panel defaultSize={30} minSize={20}><Section title="Unit Record"><UnitDetails /></Section></Panel></PanelGroup></main><main className="md:hidden flex-1 min-h-0">{mobileTab==='oob'&&<Section title='OOB'><OobTree/></Section>}{mobileTab==='map'&&<Section title='MAP'><MapScene/></Section>}{mobileTab==='details'&&<Section title='DETAILS'><UnitDetails/></Section>}</main><StatusBar /><BottomTabs /></div>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="h-full border-r border-[var(--line0)] bg-[var(--bg1)]"><header className="h-10 px-3 border-b border-[var(--line0)] flex items-center text-xs tracking-[0.08em] uppercase text-[var(--fg1)]">{title}</header><div className="h-[calc(100%-40px)]">{children}</div></section>;
}

function useKeyboardShortcuts() {
  const setMobileTab = useAppStore((s) => s.setMobileTab);
  const setSelectedUnitId = useAppStore((s) => s.setSelectedUnitId);
  const setSearch = useAppStore((s) => s.setSearch);
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/') { e.preventDefault(); (document.querySelector('input') as HTMLInputElement | null)?.focus(); }
      if (e.key === 'g') setMobileTab('map');
      if (e.key === 'o') setMobileTab('oob');
      if (e.key === 'd') setMobileTab('details');
      if (e.key === 'Escape') { setSelectedUnitId(null); setSearch(''); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setMobileTab, setSearch, setSelectedUnitId]);
}
