import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <h1 className="text-black text-4xl font-light">
          FrontendWebService is being generated
        </h1>
        <p className="text-gray-600">
          Continue to the admin area to manage external tool connections.
        </p>
        <div>
          <Link
            href="/integrations"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Integrations
          </Link>
        </div>
      </div>
    </main>
  );
}
