import React, { Suspense } from 'react';
import OAuthCallbackClient from './OAuthCallbackClient';

/**
 * PUBLIC_INTERFACE
 * OAuthCallbackPage (Server)
 * Server entry for the callback page to satisfy CSR bailout requirement.
 */
export default function OAuthCallbackPageServer() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-10 text-sm text-gray-600">Loading…</div>}>
      <OAuthCallbackClient />
    </Suspense>
  );
}
