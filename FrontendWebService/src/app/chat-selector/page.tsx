'use client';

import React, { useState } from 'react';
import { ChatSelectorOverlay } from '@/components/ChatSelectorOverlay';
import { QuickActionModal } from '@/components/QuickActionModal';

export default function ChatSelectorDemoPage() {
  const [open, setOpen] = useState(false);
  const [lastSelection, setLastSelection] = useState<string>('');
  const [qaOpen, setQaOpen] = useState<null | { connector: string; type: 'issue' | 'page' }>(null);
  const [lastCreated, setLastCreated] = useState<string>('');

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-2">Chat Selector Demo</h1>
      <p className="text-gray-600 mb-4">
        This page demonstrates the chat selector overlay with typeahead and quick actions. Configure your backend URL and dev bearer as env vars to see results.
      </p>

      <div className="flex flex-wrap gap-2 items-center mb-4">
        <button
          className="px-3 py-2 rounded bg-black text-white"
          onClick={() => setOpen(true)}
        >
          Open Selector (Jira)
        </button>
        <button
          className="px-3 py-2 rounded bg-blue-600 text-white"
          onClick={() => setQaOpen({ connector: 'jira', type: 'issue' })}
        >
          Quick Action: Create Issue (Jira)
        </button>
        <button
          className="px-3 py-2 rounded bg-indigo-600 text-white"
          onClick={() => setQaOpen({ connector: 'confluence', type: 'page' })}
        >
          Quick Action: Create Page (Confluence)
        </button>
        {lastSelection && (
          <span className="text-sm text-gray-700">
            Last selected: <span className="font-mono">{lastSelection}</span>
          </span>
        )}
        {lastCreated && (
          <span className="text-sm text-green-700">
            Created: <span className="font-mono">{lastCreated}</span>
          </span>
        )}
      </div>

      <ChatSelectorOverlay
        open={open}
        connectorId="jira"
        onClose={() => setOpen(false)}
        onSelect={(item) => {
          setLastSelection(item.title);
        }}
      />

      <QuickActionModal
        open={!!qaOpen}
        connectorId={qaOpen?.connector || 'jira'}
        action={(qaOpen?.type as 'issue' | 'page') || 'issue'}
        onClose={() => setQaOpen(null)}
        onSuccess={(res) => {
          setLastCreated(`${res.type}: ${res.title}`);
        }}
      />
    </main>
  );
}
