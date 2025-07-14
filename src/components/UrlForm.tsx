'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function UrlForm({ onSubmit }: { onSubmit: (url: string) => void }) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onSubmit(url.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
      <Input
        type="url"
        placeholder="Paste blog URL here..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
      />
      <Button type="submit" className="w-full sm:w-auto">Summarise</Button>
    </form>
  );
}
