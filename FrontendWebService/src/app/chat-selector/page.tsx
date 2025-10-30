'use client';

import React, { useState } from 'react';
import { ChatSelectorOverlay } from '@/components/ChatSelectorOverlay';

export default function ChatSelectorDemoPage() {
  const [open, setOpen] = useState(false);
  const [lastSelection, setLastSelection] = useState<string>('');

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-2">Chat Selector Demo</h1>
      <p className="text-gray-600 mb-4">
        This page demonstrates the chat selector overlay with typeahead. Configure your backend URL and dev bearer as env vars to see results.
      </p>

      <div className="flex gap-2 items-center mb-4">
        <button
          className="px-3 py-2 rounded bg-black text-white"
          onClick={() => setOpen(true)}
        >
          Open Selector (Jira)
        </button>
        {lastSelection && (
          <span className="text-sm text-gray-700">
            Last selected: <span className="font-mono">{lastSelection}</span>
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
    </main>
  );
}
