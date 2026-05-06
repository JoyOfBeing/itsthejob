'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';

const SEEDED_ENTRIES = [
  {
    id: 'seed-diane',
    who: 'Diane',
    description: 'Introduced Nicole to a CHRO at a Fortune 500 who\'s interested in piloting a 2,000-person transition.',
    category: 'Network',
    bucket: 'C',
    points_min: 2500,
    points_max: 4000,
    explanation: 'A single introduction that opened a potential six-figure enterprise contract. No invoice, no billable hours — just a relationship offered freely.',
    redemption_hint: 'At this level? Lifetime Magic Show access + a founding seat at JOB Fair.',
    open_loop_reason: 'The pilot is still in negotiation. The ledger keeps it alive until it compounds.',
  },
  {
    id: 'seed-levi',
    who: 'Levi',
    description: 'Gifted 30 Golden Tickets to Magic Shows.',
    category: 'Community',
    bucket: 'B',
    points_min: 1500,
    points_max: 3000,
    explanation: 'Thirty personal invitations sent into the world — each one a door into JOB. That\'s distribution you can\'t buy.',
    redemption_hint: 'Enough to offset a year of membership dues + priority access to every new experiment.',
    open_loop_reason: null,
  },
  {
    id: 'seed-jumpsuit',
    who: 'Jumpsuit',
    description: 'Built a new Business 3.0 IP framework.',
    category: 'Build',
    bucket: 'C',
    points_min: 3000,
    points_max: 5000,
    explanation: 'A company contributing proprietary IP directly into JOB. This isn\'t a vendor contract — it\'s a member building infrastructure.',
    redemption_hint: 'Unlocks Network-tier membership for the whole team + elder session credits.',
    open_loop_reason: 'B3.0 hasn\'t launched paid cohorts yet. When it does, this becomes the revenue engine.',
  },
];

const BUCKET_LABEL = { A: 'Operating', B: 'Validated', C: 'Open Loop' };
const BUCKET_COLOR = { A: '#3dcdb4', B: '#9b6dff', C: '#f5b544' };

function JobReportDemo() {
  const [entries, setEntries] = useState(SEEDED_ENTRIES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [latest, setLatest] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/job-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: input }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        const entry = {
          id: `live-${Date.now()}`,
          who: 'You',
          description: input,
          ...data.receipt,
        };
        setEntries(prev => [entry, ...prev]);
        setLatest(entry);
        setInput('');
      }
    } catch {
      setError('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="jr-grid">
      <div className="jr-left">
        <form onSubmit={handleSubmit}>
          <textarea
            className="jr-input"
            placeholder="e.g. 'Hosted a Sunday gathering at my house for 12 people.'"
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={3}
            disabled={loading}
          />
          <button type="submit" className="jr-submit" disabled={loading || !input.trim()}>
            {loading ? 'Reading\u2026' : 'Submit your JOB Report'}
          </button>
          {error && <p className="jr-error">{error}</p>}
        </form>

        {latest && (
          <div className="jr-receipt" style={{ borderColor: BUCKET_COLOR[latest.bucket] }}>
            <div className="jr-receipt-header">
              <span className="jr-chip" style={{ background: BUCKET_COLOR[latest.bucket] }}>
                Bucket {latest.bucket} &middot; {BUCKET_LABEL[latest.bucket]}
              </span>
              <span className="jr-chip jr-chip-outline">{latest.category}</span>
              <span className="jr-points">{latest.points_min}&ndash;{latest.points_max} pts</span>
            </div>
            <p className="jr-explanation">{latest.explanation}</p>
            {latest.redemption_hint && (
              <p className="jr-redemption">{'\u2192'} {latest.redemption_hint}</p>
            )}
            {latest.open_loop_reason && (
              <p className="jr-open-loop">{'\u25CC'} Open loop: {latest.open_loop_reason}</p>
            )}
          </div>
        )}
      </div>

      <div className="jr-right">
        <div className="jr-ledger-header">Ledger</div>
        <div className="jr-ledger">
          {entries.slice(0, 5).map(entry => (
            <div key={entry.id} className="jr-entry" style={{ borderLeftColor: BUCKET_COLOR[entry.bucket] }}>
              <div className="jr-entry-top">
                <strong>{entry.who}</strong>
                <span className="jr-entry-meta">
                  {entry.category} &middot; {entry.bucket} &middot; {entry.points_min}&ndash;{entry.points_max}
                </span>
              </div>
              <p className="jr-entry-desc">{entry.description}</p>
              {entry.redemption_hint && (
                <p className="jr-entry-redemption">{'\u2192'} {entry.redemption_hint}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RCO() {
  // Scroll reveal
  const [revealed, setRevealed] = useState(new Set());

  // Waitlist
  const [email, setEmail] = useState('');
  const [waitlistStatus, setWaitlistStatus] = useState(null);

  async function handleWaitlist(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setWaitlistStatus('sending');
    const { error } = await supabase
      .from('b30_waitlist')
      .insert({ email: email.trim(), source: 'rco-waitlist' });
    if (error && error.code === '23505') {
      setWaitlistStatus('already');
    } else if (error) {
      setWaitlistStatus('error');
    } else {
      setWaitlistStatus('done');
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRevealed((prev) => new Set([...prev, entry.target.dataset.reveal]));
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Sparkle cursor trail
  useEffect(() => {
    const colors = ['#d4b84c', '#a8c744', '#3dcdb4', '#9b6dff', '#d466b0', '#e05577', '#e8a838'];
    let cursorX = 0, cursorY = 0;
    let prevX = null, prevY = null;
    let isMoving = false;
    let moveTimeout = null;
    let animFrame = null;

    if (!document.getElementById('sparkle-keyframes')) {
      const style = document.createElement('style');
      style.id = 'sparkle-keyframes';
      style.textContent = `
        @keyframes sparkleDrift {
          0% { opacity: 0.9; transform: translate(0, 0) scale(1); }
          50% { opacity: 0.5; }
          100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(0.1); }
        }
        .sparkle-particle {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          animation: sparkleDrift var(--duration) ease-out forwards;
        }
      `;
      document.head.appendChild(style);
    }

    function spawnSparkle(x, y) {
      const el = document.createElement('div');
      el.className = 'sparkle-particle';
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 5 + 2;
      const dx = (Math.random() - 0.5) * 40;
      const dy = (Math.random() - 0.5) * 40 - 15;
      const duration = Math.random() * 1 + 1.5;
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.style.background = color;
      el.style.boxShadow = `0 0 ${size + 2}px ${color}80`;
      el.style.setProperty('--dx', dx + 'px');
      el.style.setProperty('--dy', dy + 'px');
      el.style.setProperty('--duration', duration + 's');
      document.body.appendChild(el);
      setTimeout(() => el.remove(), duration * 1000);
    }

    function sparkleLoop() {
      if (!isMoving) return;
      if (prevX !== null) {
        const dx = cursorX - prevX;
        const dy = cursorY - prevY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 2) {
          const steps = Math.max(1, Math.floor(dist / 12));
          for (let s = 0; s <= steps; s++) {
            const t = s / steps;
            spawnSparkle(prevX + dx * t + (Math.random() - 0.5) * 14, prevY + dy * t + (Math.random() - 0.5) * 14);
          }
        }
      }
      spawnSparkle(cursorX + (Math.random() - 0.5) * 14, cursorY + (Math.random() - 0.5) * 14);
      prevX = cursorX;
      prevY = cursorY;
      animFrame = requestAnimationFrame(sparkleLoop);
    }

    function handleMove(e) {
      cursorX = e.clientX;
      cursorY = e.clientY;
      if (!isMoving) {
        isMoving = true;
        prevX = cursorX;
        prevY = cursorY;
        sparkleLoop();
      }
      clearTimeout(moveTimeout);
      moveTimeout = setTimeout(() => {
        isMoving = false;
        cancelAnimationFrame(animFrame);
        prevX = null;
        prevY = null;
      }, 100);
    }

    function handleTouch(e) {
      const touch = e.touches[0];
      if (touch) handleMove({ clientX: touch.clientX, clientY: touch.clientY });
    }

    document.addEventListener('mousemove', handleMove, { passive: true });
    document.addEventListener('touchmove', handleTouch, { passive: true });
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('touchmove', handleTouch);
    };
  }, []);

  const isRevealed = (id) => revealed.has(id);

  return (
    <>
      <div className="prism-bg" />

      <div className="scroll">

        {/* ========== HERO ========== */}
        <section className="beat beat-opening">
          <div className="beat-opening-content">
            <p className="rco-back"><a href="/">{'\u2190'} itsthejob.com</a></p>
            <h1 className="wordmark rco-wordmark">The RCO</h1>
            <p className="wordmark-sub">Regenerative Community Organism</p>
            <p className="opening-hook">Not a company. Not a nonprofit. Not a co-op.</p>
            <p className="opening-hook opening-hook-bold">Something that hasn&rsquo;t existed before.</p>
          </div>
          <div className="scroll-hint">
            <span className="scroll-hint-text">scroll</span>
            <span className="scroll-hint-arrow">{'\u2193'}</span>
          </div>
        </section>

        {/* ========== WHAT IT IS ========== */}
        <section className="beat beat-story">
          <div className="story-block" data-reveal="what" style={{ opacity: isRevealed('what') ? 1 : 0, transform: isRevealed('what') ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease' }}>
            <p className="story-line story-dim">Most organizations pick a lane. Mission or money. Nonprofit or startup. Community or commerce.</p>
            <p className="story-line">We picked all of them.</p>
            <p className="story-line story-dim">An RCO is a dual-entity structure. One side holds the mission. The other side builds the business. They&rsquo;re bound together by a single question that can never be changed:</p>
            <p className="story-punch rco-question">What happens when being IS the job?</p>
          </div>
        </section>

        {/* ========== THE STRUCTURE ========== */}
        <section className="beat beat-story">
          <div className="story-block" data-reveal="structure" style={{ opacity: isRevealed('structure') ? 1 : 0, transform: isRevealed('structure') ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease' }}>
            <p className="story-line">Think of it like a living thing.</p>
            <p className="story-line story-dim">The nonprofit is the roots. JOB Church. The elders. The community. The part that holds everything sacred and keeps us honest.</p>
            <p className="story-line story-dim">The for-profit is the branches. Magic Shows. Business 3.0. The JOB Fair. The experiments that grow outward and bring resources back to the roots.</p>
            <p className="story-line">Neither one works without the other. That&rsquo;s the whole point.</p>
          </div>
        </section>

        {/* ========== MYCELIAL NETWORK ========== */}
        <section className="beat beat-story">
          <div className="story-block" data-reveal="mycelium" style={{ opacity: isRevealed('mycelium') ? 1 : 0, transform: isRevealed('mycelium') ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease' }}>
            <p className="story-line story-dim">It&rsquo;s not a hierarchy. It&rsquo;s a mycelial network.</p>
            <p className="story-line">Every person, every company, every experiment is a node. Connected to everything else. Sharing resources. Strengthening the whole.</p>
            <p className="story-line story-dim">You don&rsquo;t work <em>for</em> the organism. You work <em>with</em> it. You plug in where you&rsquo;re alive and the network routes energy where it&rsquo;s needed.</p>
          </div>
        </section>

        {/* ========== MEMBERSHIP ========== */}
        <section className="beat beat-story">
          <div className="story-block rco-wide-block" data-reveal="membership" style={{ opacity: isRevealed('membership') ? 1 : 0, transform: isRevealed('membership') ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease' }}>
            <p className="story-line">Membership isn&rsquo;t a subscription. It&rsquo;s a relationship.</p>
            <p className="story-line story-dim">You come in through any door &mdash; a Magic Show, JOB Church, Business 3.0, the Fair. You don&rsquo;t have to pick one. You just show up where you&rsquo;re drawn.</p>
            <p className="story-line story-dim">Every time you contribute, you earn points. Attend a Sunday gathering. Host a Magic Show. Bring someone in. Build something. Compost something. The organism notices.</p>
            <p className="story-line">Everything is sliding scale. Points offset dues. The organism rewards showing up.</p>

            <div className="rco-tiers">
              <div className="rco-tier" style={{ '--tier-color': '#d4b84c' }}>
                <h3 className="rco-tier-name">Individuals</h3>
                <p className="rco-tier-price">Sliding scale</p>
                <p className="rco-tier-desc">You walked through a door. You showed up. You&rsquo;re here to participate, explore, and find where you&rsquo;re alive.</p>
              </div>
              <div className="rco-tier" style={{ '--tier-color': '#9b6dff' }}>
                <h3 className="rco-tier-name">Guides</h3>
                <p className="rco-tier-price">Sliding scale</p>
                <p className="rco-tier-desc">You hold space. You facilitate. You guide. B3.0 Guides, church elders, Magic Show facilitators &mdash; you&rsquo;re the nervous system of the organism.</p>
              </div>
              <div className="rco-tier" style={{ '--tier-color': '#3dcdb4' }}>
                <h3 className="rco-tier-name">Networks</h3>
                <p className="rco-tier-price">Sliding scale</p>
                <p className="rco-tier-desc">You brought your whole team. Your organization is a node in the organism &mdash; autonomous, connected, strengthening the whole.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========== JOB REPORT ========== */}
        <section className="beat beat-story">
          <div className="story-block rco-wide-block" data-reveal="report" style={{ opacity: isRevealed('report') ? 1 : 0, transform: isRevealed('report') ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease' }}>
            <p className="story-line">The JOB Report is how the organism sees you.</p>
            <p className="story-line story-dim">Every contribution you make &mdash; an introduction, a Sunday you showed up, a thing you built, a person you brought in &mdash; gets a receipt. Points accumulate. And those points unlock things across the organism.</p>
            <p className="story-line story-dim">A Magic Show golden ticket. A seat in a B3.0 workshop. A booth at the JOB Fair. Priority access to new experiments. Dues offset. Recognition on the living map.</p>
            <p className="story-line">This isn&rsquo;t tracking. It&rsquo;s reciprocity. You give to the organism, the organism gives back.</p>

            <p className="story-line story-dim" style={{ marginTop: '1.5rem', fontSize: '0.95rem' }}><strong>Try it. Describe something you&rsquo;d contribute.</strong></p>

            <JobReportDemo />

            <p className="jr-disclaimer">JOB Points are non-monetary recognition of contribution &mdash; not a security, equity, or guarantee of payment. They represent participation within the organism&rsquo;s gift economy.</p>
          </div>
        </section>

        {/* ========== ENTITIES ========== */}
        <section className="beat beat-story">
          <div className="story-block" data-reveal="entities" style={{ opacity: isRevealed('entities') ? 1 : 0, transform: isRevealed('entities') ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease' }}>
            <p className="story-line story-dim">It&rsquo;s not just for individuals.</p>
            <p className="story-line">Companies can plug in too.</p>
            <p className="story-line story-dim">Send your team through Business 3.0. Your people become nodes in the network. Your company stays autonomous but connected to something bigger. The organism grows through connection, not acquisition.</p>
            <p className="story-line story-dim">You don&rsquo;t get acquired. You get woven in.</p>
          </div>
        </section>

        {/* ========== OWNERSHIP ========== */}
        <section className="beat beat-story">
          <div className="story-block" data-reveal="ownership" style={{ opacity: isRevealed('ownership') ? 1 : 0, transform: isRevealed('ownership') ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease' }}>
            <p className="story-line story-dim">One more thing.</p>
            <p className="story-line">The community owns what the community creates.</p>
            <p className="story-line story-dim">We raise from everywhere &mdash; community ownership, venture capital, philanthropy. But the structure ensures no single source can override the mission. The guiding question is locked. The organism protects itself.</p>
            <p className="story-line story-dim">Because that&rsquo;s how a living thing works. Every cell matters. Every source of energy feeds the whole.</p>
          </div>
        </section>

        {/* ========== CLOSE ========== */}
        <section className="beat beat-close">
          <div className="close-content" data-reveal="close" style={{ opacity: isRevealed('close') ? 1 : 0, transform: isRevealed('close') ? 'translateY(0)' : 'translateY(30px)', transition: 'all 1s ease' }}>
            <p className="close-question">This is the first RCO in America.</p>
            <p className="close-cta">We&rsquo;re building it in the open. Come be a node.</p>

            {waitlistStatus === 'done' ? (
              <p className="rco-waitlist-confirmation">You&rsquo;re on the list. The organism sees you.</p>
            ) : waitlistStatus === 'already' ? (
              <p className="rco-waitlist-confirmation">You&rsquo;re already on the list. We see you.</p>
            ) : (
              <form onSubmit={handleWaitlist} className="rco-waitlist-form">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="rco-waitlist-input"
                  required
                />
                <button type="submit" className="rco-waitlist-btn" disabled={waitlistStatus === 'sending'}>
                  {waitlistStatus === 'sending' ? 'Joining...' : 'Join the waitlist'}
                </button>
              </form>
            )}

            <a href="/" className="close-deck-link" style={{ marginTop: '1.5rem' }}>
              Back to J.O.B. {'\u2192'}
            </a>
          </div>
        </section>

      </div>
    </>
  );
}
