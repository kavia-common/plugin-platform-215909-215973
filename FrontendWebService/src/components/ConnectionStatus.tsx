'use client';

import React from 'react';

type Props = {
  status: 'connected' | 'disconnected' | 'error' | 'none' | string | undefined;
};

export function ConnectionStatus({ status }: Props) {
  let color = 'bg-gray-200 text-gray-800';
  let label = 'Not connected';

  switch (status) {
    case 'connected':
      color = 'bg-green-100 text-green-800';
      label = 'Connected';
      break;
    case 'disconnected':
      color = 'bg-gray-200 text-gray-800';
      label = 'Disconnected';
      break;
    case 'error':
      color = 'bg-red-100 text-red-800';
      label = 'Error';
      break;
    default:
      color = 'bg-gray-100 text-gray-700';
      label = 'Not connected';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded ${color}`}>
      {label}
    </span>
  );
}
