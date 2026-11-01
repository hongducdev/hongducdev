"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useTransition, type ComponentProps } from "react";
import { useNavigationPending } from "@/components/navigation-pending";
import { isModifiedClick } from "@/lib/is-modified-click";

type TransitionLinkProps = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

export function TransitionLink({ href, onClick, ...rest }: TransitionLinkProps) {
  const router = useRouter();
  const id = useId();
  const [isPending, startTransition] = useTransition();
  const { setLinkPending } = useNavigationPending();

  useEffect(() => {
    setLinkPending(id, isPending);
    return () => setLinkPending(id, false);
  }, [id, isPending, setLinkPending]);

  return (
    <Link
      {...rest}
      href={href}
      aria-busy={isPending || undefined}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || isModifiedClick(e) || rest.target === "_blank") return;
        e.preventDefault();
        startTransition(() => router.push(href));
      }}
    />
  );
}
