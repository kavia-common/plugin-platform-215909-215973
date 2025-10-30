"use server";

/**
 * PUBLIC_INTERFACE
 * generateStaticParams
 * Because this project uses output: 'export', dynamic routes must provide static params.
 * Exported from a server-only file to avoid client/server conflicts.
 */
export function generateStaticParams() {
  return [
    { connectorId: "jira" },
    { connectorId: "confluence" },
  ];
}
