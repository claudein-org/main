import { ReactNode } from 'react'

interface Props {
    children?: ReactNode
}

export default function Terminal({ children }: Props) {
    return <div style={{
        background: '#1B1F24',
        width: '100%',
        height: '100%',
        fontFamily: 'monospace',
        containerType: 'inline-size',
    }}>
        <div style={{
            background: '#2D333B',
            padding: '1.2cqw 1.6cqw',
            display: 'flex',
            gap: '1cqw',
            alignItems: 'center',
        }}>
            <div style={{ width: '3cqw', aspectRatio: 1, borderRadius: '50%', flexShrink: 0, background: '#F47067' }} />
            <div style={{ width: '3cqw', aspectRatio: 1, borderRadius: '50%', flexShrink: 0, background: '#DAAA3F' }} />
            <div style={{ width: '3cqw', aspectRatio: 1, borderRadius: '50%', flexShrink: 0, background: '#57AB5A' }} />
        </div>
        <div style={{
            padding: '2cqw 2.4cqw',
            color: '#CDD9E5',
            display: 'flex',
            flexDirection: 'column',
            fontSize: '1.5cqw',
        }}>
            {children}
        </div>
    </div>
}
