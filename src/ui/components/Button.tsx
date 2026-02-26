import { cva } from 'class-variance-authority';
import clsx from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

const styles = cva('focus-ring inline-flex items-center gap-2 border transition-colors disabled:opacity-40 disabled:cursor-not-allowed', {
  variants: {
    variant: {
      solid: 'bg-[var(--bg2)] border-[var(--line1)] hover:bg-[#273241]',
      ghost: 'border-transparent hover:bg-[var(--bg2)]',
      outline: 'border-[var(--line1)] bg-transparent hover:bg-[var(--bg2)]',
    },
    size: { sm: 'px-2 py-1 text-xs rounded-[var(--radius2)]', md: 'px-3 py-1.5 text-sm rounded-[var(--radius4)]' },
  }, defaultVariants: { variant: 'outline', size: 'sm' },
});

export function Button({ className, variant, size, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'solid'|'ghost'|'outline'; size?: 'sm'|'md' }) {
  return <button className={clsx(styles({ variant, size }), className)} {...props} />;
}
