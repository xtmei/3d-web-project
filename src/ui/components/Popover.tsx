import * as P from '@radix-ui/react-popover';
export const Popover = ({ trigger, children }: { trigger: React.ReactNode; children: React.ReactNode }) => <P.Root><P.Trigger asChild>{trigger as any}</P.Trigger><P.Portal><P.Content sideOffset={6} className="p-3 w-72 bg-[var(--bg2)] border border-[var(--line1)] shadow-[var(--shadow)]">{children}</P.Content></P.Portal></P.Root>;
