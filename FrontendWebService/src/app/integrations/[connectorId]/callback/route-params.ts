"use server";

/**
 * PUBLIC_INTERFACE
 * generateStaticParams
 * Because this project uses output: 'export', dynamic routes must provide static params.
 * We export this function from a server file to avoid conflicts with the client page.
 */
export function generateStaticParams() {
  return [
    { connectorId: "jira" },
    { connectorId: "confluence" },
  ];
}
