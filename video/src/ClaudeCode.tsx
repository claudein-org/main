import { ReactNode } from 'react'
import { staticFile } from 'remotion'
import Terminal from './Terminal'

interface Props {
    children?: ReactNode
}

export default function ClaudeCode({ children }: Props) {
    return (
        <div style={{ width: 'min(900px, 100%)' }}>
            <Terminal>
                <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem', alignItems: 'center' }}>
                    <img src={staticFile('claudecode-color.svg')} style={{ width: '128px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontSize: '1.1em', fontWeight: 'bold' }}>
                            Claude Code <span style={{ color: '#6b6b6b' }}>v3.14</span>
                        </div>
                        <div>Sonnet 6.7 with high effort · Claude Pro</div>
                        <div>~/ClaudeIn.org</div>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid #373e47' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
                    {children}
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    color: '#768390',
                    borderTop: '1px solid #373e47',
                    paddingTop: '0.75rem',
                    marginTop: '0.25rem',
                }}>
                    <span>Sonnet 6.7 · ctx 1% | tok 0.9k | $0.001</span>
                    <span>claudein.org</span>
                </div>
            </Terminal>
        </div>
    )
}
