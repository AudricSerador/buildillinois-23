import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function Terms() {
    const [terms, setTerms] = useState('');

    useEffect(() => {
        fetch('/terms.md')
            .then((response) => response.text())
            .then((text) => setTerms(text));
    }, []);

    return (
        <div className="container mx-auto w-full rounded-lg mt-8 bg-base-200 px-8 py-8 prose lg:prose-xl">
            <ReactMarkdown>{terms}</ReactMarkdown>
        </div>
    );
}
