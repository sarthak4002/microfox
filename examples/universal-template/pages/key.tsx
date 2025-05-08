import { useState } from 'react';

export default function KeyPage() {
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleClick = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch('/api/key/ses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sender: 'test@reply-bots.com',
                    recipient: 'subhakartikkireddy@gmail.com',
                    subject: 'Test',
                    bodyText: 'Test',
                    bodyHtml: '<p>Test</p>',
                    displayName: 'Test',
                }),
            });

            const data = await res.json();
            setResponse(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <button
                onClick={handleClick}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
                {loading ? 'Loading...' : 'Get Keys'}
            </button>

            {error && (
                <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            {response && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                    <pre>{JSON.stringify(response, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}
