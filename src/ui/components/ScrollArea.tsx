import type { ReactNode } from 'react';

export const ScrollArea = ({ children }: { children: ReactNode }) => <div className="h-full overflow-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-[var(--line1)]">{children}</div>;
