import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function Privacy() {
    const [privacy, setPrivacy] = useState('');

    useEffect(() => {
        fetch('/privacy.md')
            .then((response) => response.text())
            .then((text) => setPrivacy(text));
    }, []);

    return (
        <div className="container mx-auto w-full rounded-lg mt-8 bg-base-200 px-8 py-8 prose lg:prose-xl">
            <ReactMarkdown>{privacy}</ReactMarkdown>
        </div>
    );
}
