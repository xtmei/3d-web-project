import type { ReactNode } from 'react';
import * as T from '@radix-ui/react-tooltip';

export function Tooltip({ content, children }: { content: string; children: ReactNode }) {
  return <T.Provider><T.Root><T.Trigger asChild>{children as any}</T.Trigger><T.Portal><T.Content className="px-2 py-1 text-xs bg-[var(--bg2)] border border-[var(--line1)]" sideOffset={6}>{content}</T.Content></T.Portal></T.Root></T.Provider>;
}
