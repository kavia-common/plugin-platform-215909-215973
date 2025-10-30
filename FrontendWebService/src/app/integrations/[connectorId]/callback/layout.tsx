import React from "react";

/**
 * PUBLIC_INTERFACE
 * generateStaticParams
 * Provide static params for the dynamic connectorId segment to support output: 'export'.
 * Extend this list as more connectors are supported.
 */
export async function generateStaticParams() {
  return [
    { connectorId: "jira" },
    { connectorId: "confluence" },
  ];
}

/**
 * PUBLIC_INTERFACE
 * CallbackLayout
 * Server layout wrapper for the OAuth callback route. Renders children.
 */
export default async function CallbackLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
