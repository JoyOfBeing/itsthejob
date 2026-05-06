'use client';

import { useState, useEffect, useRef } from 'react';

// --- GHOST PILLS — language reclamation ---
const GHOSTS = [
  { id: 'description', label: 'JOB Description', seed: 'Not the box. You. The actual you.' },
  { id: 'offer', label: 'JOB Offer', seed: 'The offer doesn\'t need to be accepted by an employer. It needs to be accepted by you.' },
  { id: 'title', label: 'JOB Title', seed: 'The machine chose it for you. Unlearn it.' },
  { id: 'security', label: 'JOB Security', seed: 'There is no job security. There is only self security.' },
  { id: 'search', label: 'JOB Search', seed: 'You\'re not hunting for a job. You\'re listening for signal.' },
];


export default function Home() {
  // Organism chat
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatMsgsRef = useRef(null);
  const sessionIdRef = useRef(null);

  // Return visitor memory
  const [visitCount, setVisitCount] = useState(0);
  const [storedName, setStoredName] = useState('');

  // Scroll reveal
  const [revealed, setRevealed] = useState(new Set());
  const observerRef = useRef(null);

  // Ghost pill reveal
  const [activeGhost, setActiveGhost] = useState(null);

  // Generate session ID on mount
  useEffect(() => {
    sessionIdRef.current = 'sess_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }, []);

  // Return visitor memory
  useEffect(() => {
    try {
      const count = parseInt(localStorage.getItem('job-visits') || '0', 10) + 1;
      localStorage.setItem('job-visits', count.toString());
      setVisitCount(count);
      const savedName = localStorage.getItem('job-name') || '';
      if (savedName) setStoredName(savedName);
    } catch (e) { /* private browsing */ }
  }, []);

  // Tab title cycling
  useEffect(() => {
    const titles = [
      'J.O.B. \u2014 Joy of Being',
      'J.O.B. \u2014 Position: Human',
      'J.O.B. \u2014 You\u2019re Hired',
      'J.O.B. \u2014 Now What?',
      'J.O.B. \u2014 Being IS the Job',
      'J.O.B. \u2014 The Organism Is Growing',
    ];
    let i = 0;
    const cycle = setInterval(() => {
      i = (i + 1) % titles.length;
      document.title = titles[i];
    }, 8000);
    return () => clearInterval(cycle);
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
            const ix = prevX + dx * t;
            const iy = prevY + dy * t;
            spawnSparkle(ix + (Math.random() - 0.5) * 14, iy + (Math.random() - 0.5) * 14);
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

  // Intersection observer for scroll reveals
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRevealed((prev) => new Set([...prev, entry.target.dataset.reveal]));
          }
        });
      },
      { threshold: 0.15 }
    );

    // Small delay to ensure all elements are rendered
    const timer = setTimeout(() => {
      document.querySelectorAll('[data-reveal]').forEach((el) => {
        observerRef.current.observe(el);
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      observerRef.current?.disconnect();
    };
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (chatMsgsRef.current) chatMsgsRef.current.scrollTop = chatMsgsRef.current.scrollHeight;
  }, [chatMessages]);

  // --- HANDLERS ---

  async function sendOrgMessage(e) {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading || chatMessages.length >= 20) return;
    const userMsg = { role: 'user', content: chatInput.trim() };
    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setChatInput('');
    setChatLoading(true);
    try {
      const chatUrl = process.env.NEXT_PUBLIC_PULSE_URL || 'http://localhost:3001';
      const res = await fetch(`${chatUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          vibe: 'weird',
          session_id: sessionIdRef.current,
          visitor_id: visitCount,
          source: 'portal',
        }),
      });
      const data = await res.json();
      const answer = data.error || data.answer;
      setChatMessages([...newMessages, { role: 'assistant', content: answer }]);
    } catch {
      setChatMessages([...newMessages, { role: 'assistant', content: 'JOB is resting. Try again in a moment.' }]);
    }
    setChatLoading(false);
  }

  const isRevealed = (id) => revealed.has(id);

  return (
    <>
      {/* Prismatic background — fixed, dark with rainbow bleed */}
      <div className="prism-bg" />

      <div className="scroll">

        {/* ========== BEAT 1: THE HOOK ========== */}
        <section className="beat beat-opening">
          <div className="beat-opening-content">
            <h1 className="wordmark">J.O.B.</h1>
            <p className="wordmark-sub">Joy of Being</p>
            <p className="opening-hook">Everybody&rsquo;s freaking out about losing their jobs.</p>
            <p className="opening-hook opening-hook-bold">We&rsquo;re over here remembering what the real one was all along.</p>
            {storedName && visitCount >= 2 && (
              <p className="return-whisper">
                {visitCount >= 3 ? `${storedName} keeps coming back.` : `${storedName}. You came back.`}
              </p>
            )}
          </div>
          <div className="scroll-hint">
            <span className="scroll-hint-text">scroll</span>
            <span className="scroll-hint-arrow">{'\u2193'}</span>
          </div>
        </section>

        {/* ========== BEAT 2: THE MAGIC SHOW → JOB Shows ========== */}
        <section className="beat beat-story">
          <div className="story-block" data-reveal="magic" style={{ opacity: isRevealed('magic') ? 1 : 0, transform: isRevealed('magic') ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease' }}>
            <p className="story-line">The job? Be yourself. Seriously.</p>
            <p className="story-line story-dim">We started by putting 10 strangers in a room, calling it a Magic Show, and paying them to be magic together. No agenda. No deliverables.</p>
            <p className="story-line story-dim">Just: show up, feel shit, be weird, get paid.</p>
            <p className="story-punch">It worked.</p>
            <a href="https://magic-show-pi.vercel.app" target="_blank" rel="noopener noreferrer" className="story-door" style={{ '--door-color': '#e05577' }}>
              <span className="story-door-dept">Dept. of You Had to Be There</span>
              <span className="story-door-label">Magic Shows {'\u2192'}</span>
            </a>
          </div>
        </section>

        {/* ========== BEAT 3: WE NEED A CONTAINER → Business 3.0 ========== */}
        <section className="beat beat-story">
          <div className="story-block" data-reveal="system" style={{ opacity: isRevealed('system') ? 1 : 0, transform: isRevealed('system') ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease' }}>
            <p className="story-line story-dim">Now we had a problem. Magic doesn&rsquo;t fit in a spreadsheet.</p>
            <p className="story-line story-dim">Companies are machines. They extract. They optimize. They squeeze until there&rsquo;s nothing left.</p>
            <p className="story-line story-dim">We needed something that could breathe. Something that grows the way a forest grows &mdash; not by forcing, but by being.</p>
            <p className="story-line">So we built an organism.</p>
            <a href="https://business-30.vercel.app" target="_blank" rel="noopener noreferrer" className="story-door" style={{ '--door-color': '#9b6dff' }}>
              <span className="story-door-dept">Dept. of Businessing Differently</span>
              <span className="story-door-label">Business 3.0 {'\u2192'}</span>
            </a>
          </div>
        </section>

        {/* ========== BEAT 4: THE RCO ========== */}
        <section className="beat beat-story">
          <div className="story-block" data-reveal="rco" style={{ opacity: isRevealed('rco') ? 1 : 0, transform: isRevealed('rco') ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease' }}>
            <p className="story-line">JOB is now the first RCO in the US.</p>
            <p className="story-line story-dim">That stands for Regenerative Community Organism. It&rsquo;s designed to pair an experimental, profitable side with a nonprofit that keeps it accountable to one question:</p>
            <p className="story-line"><em>What happens when being is the job?</em></p>
            <p className="story-line story-dim">Every human, company, and experiment in the organism is seeking to answer it. Which meant we needed a nonprofit to protect it. Should it be a 501(c)(3)?</p>
            <a href="/rco" className="story-door" style={{ '--door-color': '#3dcdb4' }}>
              <span className="story-door-dept">The Living System</span>
              <span className="story-door-label">The RCO {'\u2192'}</span>
            </a>
          </div>
        </section>

        {/* ========== THE CHURCH — THE NONPROFIT SIDE ========== */}
        <section className="beat beat-story">
          <div className="story-block" data-reveal="church" style={{ opacity: isRevealed('church') ? 1 : 0, transform: isRevealed('church') ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease' }}>
            <p className="rco-side-label">The Nonprofit Side</p>
            <p className="story-line">We built a church.</p>
            <p className="story-line story-dim">Not because we wanted to start a religion. Because someone has to hold the question. Someone has to keep the whole thing honest. And we believe that showing up &mdash; just being here &mdash; is a sacred act.</p>
            <p className="story-line story-dim">Church got hijacked by answers. We brought it back to the question. And it shall be called: Joy of Being.</p>
            <a href="https://apply.itsthejob.com" target="_blank" rel="noopener noreferrer" className="story-door" style={{ '--door-color': '#d4b84c' }}>
              <span className="story-door-dept">Dept. of Becoming</span>
              <span className="story-door-label">JOB Church {'\u2192'}</span>
            </a>
          </div>
        </section>

        {/* ========== JOB INC. — THE FOR-PROFIT SIDE ========== */}
        <section className="beat beat-story beat-forprofit">
          <div className="story-block rco-wide-block" data-reveal="forprofit" style={{ opacity: isRevealed('forprofit') ? 1 : 0, transform: isRevealed('forprofit') ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease' }}>
            <p className="rco-side-label">JOB Inc. &mdash; The For-Profit Side</p>
            <p className="story-line story-dim">The church holds the soul. But an organism needs a body.</p>
            <p className="story-line story-dim">So we started running experiments. Each one asks the same question in a different room. The ones with energy become real companies &mdash; standalone businesses that feed the organism.</p>

            <div className="experiment-cards">
              <a href="https://magic-show-pi.vercel.app" target="_blank" rel="noopener noreferrer" className="experiment-card" style={{ '--door-color': '#e05577' }}>
                <span className="experiment-name">Magic Shows</span>
                <span className="experiment-why">What does being look like when strangers pay to be magic together? We had to find out.</span>
              </a>
              <a href="https://business-30.vercel.app" target="_blank" rel="noopener noreferrer" className="experiment-card" style={{ '--door-color': '#9b6dff' }}>
                <span className="experiment-name">Business 3.0</span>
                <span className="experiment-why">Companies are machines. What if they were organisms? We built the playbook for the shift.</span>
              </a>
              <a href="https://new-human-resources.vercel.app" target="_blank" rel="noopener noreferrer" className="experiment-card" style={{ '--door-color': '#3dcdb4' }}>
                <span className="experiment-name">JOB Training</span>
                <span className="experiment-why">Millions are losing their jobs to AI. What does being look like in the middle of that grief? We built the landing pad.</span>
              </a>
              <a href="https://job-fair-nine.vercel.app" target="_blank" rel="noopener noreferrer" className="experiment-card" style={{ '--door-color': '#e8a838' }}>
                <span className="experiment-name">JOB Fair</span>
                <span className="experiment-why">What if there was a place where the new economy showed up in person? A literal fair. You might end up working it.</span>
              </a>
              <div className="experiment-card experiment-card-coming" style={{ '--door-color': '#a8c744' }}>
                <span className="experiment-name">JOB Board</span>
                <span className="experiment-why">What does being look like when you get paid for it? A marketplace for things only humans can do. Opening soon.</span>
              </div>
              <div className="experiment-card experiment-card-coming" style={{ '--door-color': '#d466b0' }}>
                <span className="experiment-name">JOB Sites</span>
                <span className="experiment-why">What does being look like in a physical space designed for it? We&rsquo;re scouting castles. Literally.</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========== THE EXPANSION ========== */}
        <section className="beat beat-story">
          <div className="story-block" data-reveal="expansion" style={{ opacity: isRevealed('expansion') ? 1 : 0, transform: isRevealed('expansion') ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1s ease' }}>
            <p className="story-line story-dim">Then we realized something. Every conscious being is already trying to do its job. Dogs. Cats. Horses. They&rsquo;re already being. We&rsquo;re the ones who forgot how.</p>
            <p className="story-line">So we expanded beyond humans.</p>
            <p className="story-line story-dim">Which accidentally created more human jobs. Dog death doulas. Cat reiki trainers. Equine therapists. Turns out, helping other beings be themselves is one of the most human things you can do.</p>
          </div>
        </section>

        {/* ========== THE ORGANISM (AI Chat) ========== */}
        <section className="beat beat-organism">
          <div className="organism-intro" data-reveal="organism" style={{ opacity: isRevealed('organism') ? 1 : 0, transform: isRevealed('organism') ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.8s ease' }}>
            <h2 className="organism-heading">Still curious?</h2>
            <p className="organism-sub">JOB is alive. Ask it anything.</p>
          </div>

          <div className="organism-chat-box" data-reveal="chat" style={{ opacity: isRevealed('chat') ? 1 : 0, transform: isRevealed('chat') ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s ease 0.2s' }}>
            <div className="organism-chat-glow" />
            <div className="organism-chat-messages" ref={chatMsgsRef}>
              {chatMessages.length === 0 && (
                <div className="organism-msg assistant organism-whisper">
                  <span className="organism-msg-who">JOB</span>
                  <p>Say something only a human would say.</p>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`organism-msg ${msg.role}`}>
                  {msg.role === 'assistant' && <span className="organism-msg-who">JOB</span>}
                  <p style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                </div>
              ))}
              {chatLoading && (
                <div className="organism-msg assistant">
                  <span className="organism-msg-who">JOB</span>
                  <p style={{ fontStyle: 'italic', opacity: 0.6 }}>breathing...</p>
                </div>
              )}
            </div>
            {chatMessages.length >= 20 ? (
              <p className="organism-chat-limit">JOB needs rest. Come back later.</p>
            ) : (
              <form onSubmit={sendOrgMessage} className="organism-chat-form">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Say something only a human would say..."
                  className="organism-chat-input"
                  disabled={chatLoading}
                />
                <button type="submit" className="organism-chat-send" disabled={chatLoading || !chatInput.trim()}>
                  {'\u21B5'}
                </button>
              </form>
            )}
          </div>
        </section>

        {/* ========== THE CLOSE ========== */}
        <section className="beat beat-close">
          <div className="close-content" data-reveal="close" style={{ opacity: isRevealed('close') ? 1 : 0, transform: isRevealed('close') ? 'translateY(0)' : 'translateY(30px)', transition: 'all 1s ease' }}>
            <p className="close-question">What if being is the job?</p>
            <p className="close-cta">Only one way to find out.</p>
            <a
              href="https://job-deck-indol.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="close-deck-link"
            >
              How it all fits together {'\u2192'}
            </a>
          </div>

          {/* Ghost pills — Easter eggs */}
          <div className="ghosts-row" data-reveal="ghosts" style={{ opacity: isRevealed('ghosts') ? 1 : 0, transition: 'opacity 1.5s ease 0.5s' }}>
            {GHOSTS.map((ghost) => (
              <button
                key={ghost.id}
                className={`ghost-pill ${activeGhost === ghost.id ? 'ghost-pill-active' : ''}`}
                onClick={() => setActiveGhost(activeGhost === ghost.id ? null : ghost.id)}
              >
                {ghost.label}
                {activeGhost === ghost.id && (
                  <span className="ghost-pill-seed">{ghost.seed}</span>
                )}
              </button>
            ))}
          </div>
        </section>

      </div>
    </>
  );
}
