'use client';

import Link, { LinkProps } from 'next/link';
import NProgress from 'nprogress';

type NavLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & LinkProps & {
  children: React.ReactNode;
};


export default function NavLink({ href, children, onClick, ...props }: NavLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    // Instantly start the premium progress spinner on click
    NProgress.start();
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}

