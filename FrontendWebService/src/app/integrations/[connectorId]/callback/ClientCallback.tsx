'use client';

import React, { Suspense } from 'react';
import OAuthCallbackPage from './page';

/**
 * PUBLIC_INTERFACE
 * ClientCallback
 * Minimal client component that ensures a Suspense boundary wraps the page content
 * to satisfy Next.js requirement for useSearchParams with CSR bailout.
 */
export default function ClientCallback() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-10 text-sm text-gray-600">Loading…</div>}>
      <OAuthCallbackPage />
    </Suspense>
  );
}
