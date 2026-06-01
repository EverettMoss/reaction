import { useState } from 'react';

interface Props {
  code: string;
}

export default function RoomCodeDisplay({ code }: Props) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="text-center">
      <div className="text-xs text-gray-400 uppercase tracking-widest mb-2">Room Code</div>
      <button
        onClick={handleCopy}
        className="text-5xl font-bold tracking-[0.25em] text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
      >
        {code}
      </button>
      <div className="text-xs text-gray-500 mt-2 h-4">
        {copied ? 'Copied!' : 'Click to copy'}
      </div>
    </div>
  );
}
