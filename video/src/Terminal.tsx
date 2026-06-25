import { ReactNode } from 'react'

interface Props {
    children?: ReactNode
}

export default function Terminal({ children }: Props) {
    return (
        <div style={{
            background: '#1B1F24',
            width: '100%',
            height: '100%',
            fontFamily: 'monospace',
            containerType: 'inline-size',
        }}>
            <div style={{
                background: '#2D333B',
                padding: '0.75rem 1rem',
                display: 'flex',
                gap: '6px',
                alignItems: 'center',
            }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0, background: '#F47067' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0, background: '#DAAA3F' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0, background: '#57AB5A' }} />
            </div>
            <div style={{
                padding: '1.25rem 1.5rem',
                color: '#CDD9E5',
                display: 'flex',
                flexDirection: 'column',
                fontSize: '1.5cqw',
            }}>
                {children}
            </div>
        </div>
    )
}
