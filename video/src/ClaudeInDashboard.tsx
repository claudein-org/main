import { ReactNode } from 'react'
import { staticFile } from 'remotion'

// Cursor SVG — simple arrow pointer
export function PointerCursor({ style }: { style?: React.CSSProperties }) {
    return (
        <svg
            width="32" height="40"
            viewBox="0 0 32 40"
            style={{ position: 'absolute', pointerEvents: 'none', ...style }}
        >
            <path
                d="M0 0 L0 32 L8 24 L16 40 L20 38 L12 22 L24 22 Z"
                fill="white"
                stroke="#333"
                strokeWidth="1.5"
            />
        </svg>
    )
}

interface PostCardProps {
    text: string
    date: string
    highlighted?: boolean
    buttonState?: 'idle' | 'posting' | 'posted'
}

function PostCard({ text, date, highlighted, buttonState = 'idle' }: PostCardProps) {
    const btnLabel = buttonState === 'idle' ? 'LinkedIn' : buttonState === 'posting' ? 'Posting…' : 'View on LinkedIn'
    const btnBg = buttonState === 'posted' ? '#057642' : '#0a66c2'

    return (
        <div style={{
            background: '#fff',
            border: highlighted ? '2px solid #0a66c2' : '1px solid #e0e0e0',
            borderRadius: '0.5rem',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
            boxShadow: highlighted ? '0 0 0 3px rgba(10,102,194,0.15)' : 'none',
            position: 'relative',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <img
                    src={staticFile('gilad.jpeg')}
                    style={{ width: '2rem', height: '2rem', borderRadius: '50%' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.78rem' }}>You</span>
                    <span style={{ fontSize: '0.7rem', color: '#888' }}>{date}</span>
                </div>
            </div>
            <p style={{ fontSize: '0.8rem', margin: 0, color: '#111', lineHeight: 1.4 }}>{text}</p>
            <button style={{
                alignSelf: 'flex-start',
                background: btnBg,
                color: '#fff',
                border: 'none',
                borderRadius: '1rem',
                padding: '0.3rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
            }}>
                {btnLabel}
            </button>
        </div>
    )
}

const POSTS = [
    { text: 'Claude Code + LinkedIn = ClaudeIn.', date: 'Jun 24' },
    { text: 'ClaudeIn turns your Claude Code into a social media manager.', date: 'Jun 28' },
    { text: 'What if your IDE was also your LinkedIn ghostwriter? Introducing ClaudeIn.', date: 'Jun 28' },
    { text: 'A viral post about ClaudeIn', date: 'Jun 28' },
]

interface Props {
    scrollY?: number
    highlightLast?: boolean
    buttonState?: 'idle' | 'posting' | 'posted'
    children?: ReactNode
}

export default function ClaudeInDashboard({ scrollY = 0, highlightLast, buttonState = 'idle' }: Props) {
    return (
        <div style={{
            width: '100%', height: '100%',
            background: '#f3f2ef',
            fontFamily: 'system-ui, sans-serif',
            display: 'flex',
            overflow: 'hidden',
            fontSize: '16px',
        }}>
            {/* Browser chrome */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column' }}>
                {/* URL bar */}
                <div style={{ background: '#202124', padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F47067' }} />
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#DAAA3F' }} />
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#57AB5A' }} />
                    </div>
                    <div style={{
                        background: '#35363a', borderRadius: '1rem', padding: '0.2rem 0.75rem',
                        fontSize: '0.75rem', color: '#9aa0a6', flex: 1, textAlign: 'center',
                    }}>
                        claudein.org/dash
                    </div>
                </div>

                {/* App body */}
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    {/* Sidebar */}
                    <aside style={{
                        width: '14rem', background: '#fff',
                        borderRight: '1px solid #e0e0e0',
                        display: 'flex', flexDirection: 'column', gap: '1rem',
                        padding: '1rem 0.75rem', flexShrink: 0,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '0.5rem' }}>
                            <img src={staticFile('claudecode-color.svg')} style={{ width: 28 }} />
                            <span style={{ fontWeight: 700, fontSize: '1rem' }}>
                                <span style={{ color: '#D97757' }}>claude</span>
                                <span style={{ color: '#0a66c2' }}>in</span>
                            </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <button style={{ background: 'none', border: 'none', textAlign: 'left', padding: '0.4rem 0.5rem', borderRadius: '0.3rem', fontSize: '0.85rem', color: '#666', cursor: 'pointer' }}>Brand</button>
                            <button style={{ background: '#f0f4ff', border: 'none', textAlign: 'left', padding: '0.4rem 0.5rem', borderRadius: '0.3rem', fontSize: '0.85rem', color: '#0a66c2', fontWeight: 600, cursor: 'pointer' }}>Posts</button>
                        </div>
                        <div style={{ marginTop: 'auto', fontSize: '0.75rem', color: '#888' }}>
                            <div style={{ fontWeight: 600, marginBottom: '0.3rem' }}>Connections</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem 0' }}>
                                <span>LinkedIn</span>
                                <span style={{ color: '#057642', fontSize: '0.7rem' }}>✓ Connected</span>
                            </div>
                        </div>
                    </aside>

                    {/* Main content */}
                    <main style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '1rem',
                            padding: '1.25rem',
                            transform: `translateY(${-scrollY}px)`,
                        }}>
                            {POSTS.map((p, i) => (
                                <PostCard
                                    key={i}
                                    text={p.text}
                                    date={p.date}
                                    highlighted={highlightLast && i === POSTS.length - 1}
                                    buttonState={highlightLast && i === POSTS.length - 1 ? buttonState : 'idle'}
                                />
                            ))}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}
