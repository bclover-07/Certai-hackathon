'use client';

import Link, { LinkProps } from 'next/link';
import { useRouter } from 'next/navigation';
import NProgress from 'nprogress';

type NavLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & LinkProps & {
  children: React.ReactNode;
};


export default function NavLink({ href, children, onClick, ...props }: NavLinkProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (
      !e.defaultPrevented &&
      e.button === 0 &&
      (!props.target || props.target === '_self') &&
      !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
    ) {
      e.preventDefault();
      NProgress.start();
      router.push(href.toString());
      if (onClick) {
        onClick(e);
      }
    }
  };

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
