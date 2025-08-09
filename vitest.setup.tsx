import '@testing-library/jest-dom/vitest';

import React from 'react';
import type { AnchorHTMLAttributes, ImgHTMLAttributes, PropsWithChildren } from 'react';
import type { UrlObject } from 'url';
import { vi } from 'vitest';

globalThis.React = React;

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Types for the mocked <Image />
type NextImageMockProps = ImgHTMLAttributes<HTMLImageElement> & {
  alt?: string;
};

vi.mock('next/image', () => {
  const MockedImage = (props: NextImageMockProps) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt ?? ''} />;
  };

  return {
    __esModule: true,
    default: MockedImage,
  };
});

// Types for the mocked <Link />
type LinkHref = string | URL | UrlObject;
type LinkMockProps = PropsWithChildren<
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { href: LinkHref }
>;

vi.mock('next/link', () => {
  const Link = ({ href, children, ...rest }: LinkMockProps) => {
    let hrefStr = '';

    if (typeof href === 'string') {
      hrefStr = href;
    } else if (href instanceof URL) {
      hrefStr = href.toString();
    } else {
      const { pathname = '', hash = '', search } = href as UrlObject & { search?: string };
      hrefStr = `${pathname}${search ?? ''}${hash ?? ''}`;
    }

    return (
      <a href={hrefStr} {...rest}>
        {children}
      </a>
    );
  };

  return {
    __esModule: true,
    default: Link,
  };
});

vi.mock('next/font/google', () => ({
  Inter: () => ({ className: 'font-inter' }),
}));
