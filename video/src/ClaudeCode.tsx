import { ReactNode } from 'react'
import { ClaudeLaughing } from './ClaudeLaughing'
import Terminal from './Terminal'

interface Props {
    laughing?: boolean
    ctx?: number
    tok?: number
    cost?: number
    children?: ReactNode
}

export default function ClaudeCode({
    laughing = false,
    ctx = 0,
    tok = 0,
    cost = 0,
    children }: Props) {
    const line = <div style={{ borderTop: '0.2cqw solid #6b7280' }} />
    return (
        <div style={{ width: '100%', height: '100%' }}>
            <Terminal>
                <div style={{ display: 'flex', flexDirection: 'row', gap: '1.8cqw', alignItems: 'center' }}>
                    <ClaudeLaughing laughing={laughing} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1cqw', fontSize: '2.5cqw' }}>
                        <div style={{ fontWeight: 'bold' }}>
                            Claude Code <span style={{ color: '#6b6b6b' }}>v3.14</span>
                        </div>
                        <div>Sonnet 6.7 with high effort · Claude Pro</div>
                        <div>~/ClaudeIn.org</div>
                    </div>
                </div>


                {line}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1cqw', marginTop: '1.1cqw', paddingBottom: '1.1cqw' }}>
                    {children}
                </div>
                {line}

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '2.2cqw',
                    color: '#768390',
                    paddingTop: '1.1cqw',
                }}>
                    <span>Sonnet 6.7 · ctx {ctx}% | tok {tok} | ${cost}</span>
                    <span>claudein.org</span>
                </div>
            </Terminal>
        </div>
    )
}
