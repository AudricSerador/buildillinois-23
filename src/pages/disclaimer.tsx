import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function Disclaimer() {
    const [disclaimer, setDisclaimer] = useState('');

    useEffect(() => {
        fetch('/disclaimer.md')
            .then((response) => response.text())
            .then((text) => setDisclaimer(text));
    }, []);

    return (
        <div className="container mx-auto w-full rounded-lg mt-8 bg-base-200 px-8 py-8 prose lg:prose-xl">
            <ReactMarkdown>{disclaimer}</ReactMarkdown>
        </div>
    );
}
