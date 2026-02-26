import type { InputHTMLAttributes } from 'react';
export const Input = (props: InputHTMLAttributes<HTMLInputElement>) => <input {...props} className="focus-ring w-full bg-[var(--bg1)] border border-[var(--line1)] rounded-[var(--radius4)] px-3 py-1.5 text-sm" />;
