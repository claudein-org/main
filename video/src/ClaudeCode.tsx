import { ReactNode } from 'react'
import { staticFile } from 'remotion'
import Terminal from './Terminal'

interface Props {
    children?: ReactNode
}

export default function ClaudeCode({ children }: Props) {
    const line = <div style={{ borderTop: '1px solid #6b7280' }} />
    return (
        <div style={{ width: '100%', height: '100%' }}>
            <Terminal>
                <div style={{ display: 'flex', flexDirection: 'row', gap: '1.2em', alignItems: 'center' }}>
                    <img src={staticFile('claudecode-color.svg')} style={{ width: '128px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2em' }}>
                        <div style={{ fontSize: '1.1em', fontWeight: 'bold' }}>
                            Claude Code <span style={{ color: '#6b6b6b' }}>v3.14</span>
                        </div>
                        <div>Sonnet 6.7 with high effort · Claude Pro</div>
                        <div>~/ClaudeIn.org</div>
                    </div>
                </div>


                {line}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75em', paddingBottom: '0.75em' }}>
                    {children}
                </div>
                {line}

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    color: '#768390',
                    paddingTop: '0.75em',
                }}>
                    <span>Sonnet 6.7 · ctx 1% | tok 0.9k | $0.001</span>
                    <span>claudein.org</span>
                </div>
            </Terminal>
        </div>
    )
}
