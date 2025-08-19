import '@testing-library/jest-dom/vitest';

import React, { type ComponentProps, type ReactNode } from 'react';
import { beforeEach, vi } from 'vitest';

// Global React
globalThis.React = React;

// Clean setup
beforeEach(() => {
  vi.clearAllMocks();
  vi.clearAllTimers();
});

// Next.js Router Mock
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}));

// next/image mock
interface MockImageProps extends Omit<ComponentProps<'img'>, 'src'> {
  src: string | { src: string };
  alt: string;
}

// Simple Image Mock
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: MockImageProps) => {
    const { src, alt, ...rest } = props;
    const imgSrc = typeof src === 'object' ? src.src : src;
    return React.createElement('img', {
      src: imgSrc,
      alt,
      'data-testid': 'mock-image',
      ...rest,
    });
  },
}));

// --- next/link mock ---
interface MockLinkProps extends Omit<ComponentProps<'a'>, 'href'> {
  href: string | { pathname: string };
  children: ReactNode;
}

// Link Mock
vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: MockLinkProps) => {
    return React.createElement(
      'a',
      {
        href: typeof href === 'string' ? href : href.pathname,
        ...props,
      },
      children
    );
  },
}));

// Global Mock for next/font/local
vi.mock('next/font/local', () => ({
  __esModule: true,
  default: () => ({
    variable: 'mock-font-variable',
  }),
}));
