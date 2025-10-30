'use client';

import React, { useState } from 'react';
import { QuickActionModal } from '@/components/QuickActionModal';

/**
 * PUBLIC_INTERFACE
 * QuickActionsLauncher
 * Small control used on the Integrations page to demo quick actions.
 */
export default function QuickActionsLauncher() {
  const [qaOpen, setQaOpen] = useState<null | { connector: string; type: 'issue' | 'page' }>(null);
  const [last, setLast] = useState<string>('');

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <button
          className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm"
          onClick={() => setQaOpen({ connector: 'jira', type: 'issue' })}
        >
          Create Issue
        </button>
        <button
          className="px-3 py-1.5 rounded bg-indigo-600 text-white text-sm"
          onClick={() => setQaOpen({ connector: 'confluence', type: 'page' })}
        >
          Create Page
        </button>
      </div>
      {last && <div className="text-xs text-gray-600">Created: {last}</div>}

      <QuickActionModal
        open={!!qaOpen}
        connectorId={qaOpen?.connector || 'jira'}
        action={(qaOpen?.type as 'issue' | 'page') || 'issue'}
        onClose={() => setQaOpen(null)}
        onSuccess={(res) => setLast(`${res.type}: ${res.title}`)}
      />
    </div>
  );
}
