'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const FLICKERS = [
  'Department of Lost Things',
  'Department of Not Yet',
  'Department of Wrong Turns',
  'Department of Good Instincts',
  'Department of Almost',
];

export default function NotFound() {
  const [dept, setDept] = useState('Department of \u2588\u2588\u2588\u2588\u2588\u2588');

  useEffect(() => {
    const flicker = setInterval(() => {
      const word = FLICKERS[Math.floor(Math.random() * FLICKERS.length)];
      setDept(word);
      setTimeout(() => setDept('Department of \u2588\u2588\u2588\u2588\u2588\u2588'), 200);
    }, 4000);
    return () => clearInterval(flicker);
  }, []);

  return (
    <main className="fourohfour">
      {/* You found the 404. The organism is impressed.
          Most people never try doors that don't exist yet.
          That's exactly the kind of thing we're looking for. */}
      <div className="fourohfour-dept">{dept}</div>
      <h1 className="fourohfour-title">This room is empty.</h1>
      <p className="fourohfour-body">
        Not because nothing belongs here &mdash; because it hasn&apos;t been built yet.
        The organism is still growing. You just got here before this part did.
      </p>
      <p className="fourohfour-body fourohfour-dim">
        The fact that you tried this door tells us something about you.
      </p>
      <Link href="/" className="fourohfour-link">
        Go back to the doors that exist (for now)
      </Link>
    </main>
  );
}
