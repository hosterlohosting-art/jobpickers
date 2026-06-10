'use client';

import { useState } from 'react';
import { Bookmark } from 'lucide-react';

interface BookmarkButtonProps {
  jobId: string;
  initialSaved: boolean;
}

export default function BookmarkButton({ jobId, initialSaved }: BookmarkButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (loading) return;
    setLoading(true);
    
    // Optimistic UI update
    const previousSaved = saved;
    setSaved(!previousSaved);

    try {
      const res = await fetch('/api/jobs/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId })
      });
      if (res.ok) {
        const data = await res.json();
        setSaved(data.saved);
      } else {
        setSaved(previousSaved);
      }
    } catch (err) {
      console.error('Failed to save bookmark:', err);
      setSaved(previousSaved);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={loading}
      className={`px-4 py-3 rounded border transition-all duration-200 flex items-center justify-center gap-1.5 font-semibold text-sm ${
        saved
          ? 'border-accent-green/30 bg-accent-green/10 text-accent-green'
          : 'border-grayBorder hover:bg-grayBg text-slateText-secondary hover:text-slateText-primary'
      }`}
    >
      <Bookmark className={`w-4 h-4 ${saved ? 'fill-accent-green' : ''}`} />
      <span>{saved ? 'Saved' : 'Save'}</span>
    </button>
  );
}
