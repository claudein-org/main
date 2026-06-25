import { loadFont } from '@remotion/google-fonts/Inter'
import { ReactNode } from 'react'
import { staticFile } from 'remotion'

const { fontFamily } = loadFont()

interface Props {
    likes?: number
    comments?: number
    reposts?: number
    children?: ReactNode
}

function IconThumbsUp() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" style={{ width: '2.5cqw', height: '2.5cqw' }}>
            <path d="m12.91 7-2.25-2.57a8.2 8.2 0 0 1-1.5-2.55L9 1.37A2.08 2.08 0 0 0 7 0a2.08 2.08 0 0 0-2.06 2.08v1.17a5.8 5.8 0 0 0 .31 1.89l.28.86H2.38A1.47 1.47 0 0 0 1 7.47a1.45 1.45 0 0 0 .64 1.21 1.48 1.48 0 0 0-.37 2.06 1.54 1.54 0 0 0 .62.51h.05a1.6 1.6 0 0 0-.19.71A1.47 1.47 0 0 0 3 13.42v.1A1.46 1.46 0 0 0 4.4 15h4.83a5.6 5.6 0 0 0 2.48-.58l1-.42H14V7zM12 12.11l-1.19.52a3.6 3.6 0 0 1-1.58.37H5.1a.55.55 0 0 1-.53-.4l-.14-.48-.49-.21a.56.56 0 0 1-.34-.6l.09-.56-.42-.42a.56.56 0 0 1-.09-.68L3.55 9l-.4-.61A.28.28 0 0 1 3.3 8h5L7.14 4.51a4.2 4.2 0 0 1-.2-1.26V2.08A.09.09 0 0 1 7 2a.1.1 0 0 1 .08 0l.18.51a10 10 0 0 0 1.9 3.24l2.84 3z" />
        </svg>
    )
}

function IconComment() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" style={{ width: '2.5cqw', height: '2.5cqw' }}>
            <path d="M5 8h5v1H5zm11-.5v.08a6 6 0 0 1-2.75 5L8 16v-3H5.5A5.51 5.51 0 0 1 0 7.5 5.62 5.62 0 0 1 5.74 2h4.76A5.5 5.5 0 0 1 16 7.5m-2 0A3.5 3.5 0 0 0 10.5 4H5.74A3.62 3.62 0 0 0 2 7.5 3.53 3.53 0 0 0 5.5 11H10v1.33l2.17-1.39A4 4 0 0 0 14 7.58zM5 7h6V6H5z" />
        </svg>
    )
}

function IconRepost() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" style={{ width: '2.5cqw', height: '2.5cqw' }}>
            <path d="M4 10H2V5c0-1.66 1.34-3 3-3h3.85L7.42 0h2.44L12 3 9.86 6H7.42l1.43-2H5c-.55 0-1 .45-1 1zm8-4v5c0 .55-.45 1-1 1H7.15l1.43-2H6.14L4 13l2.14 3h2.44l-1.43-2H11c1.66 0 3-1.34 3-3V6z" />
        </svg>
    )
}

function IconSend() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" style={{ width: '2.5cqw', height: '2.5cqw' }}>
            <path d="M14 2 0 6.67l5 2.64 5.67-3.98L6.7 11l2.63 5z" />
        </svg>
    )
}

function IconGlobe() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" style={{ width: '1.8cqw', height: '1.8cqw' }}>
            <path d="M8 1a7 7 0 1 0 7 7 7 7 0 0 0-7-7M3 8a5 5 0 0 1 1-3l.55.55A1.5 1.5 0 0 1 5 6.62v1.07a.75.75 0 0 0 .22.53l.56.56a.75.75 0 0 0 .53.22H7v.69a.75.75 0 0 0 .22.53l.56.56a.75.75 0 0 1 .22.53V13a5 5 0 0 1-5-5m6.24 4.83 2-2.46a.75.75 0 0 0 .09-.8l-.58-1.16A.76.76 0 0 0 10 8H7v-.19a.51.51 0 0 1 .28-.45l.38-.19a.74.74 0 0 1 .68 0L9 7.5l.38-.7a1 1 0 0 0 .12-.48v-.85a.78.78 0 0 1 .21-.53l1.07-1.09a5 5 0 0 1-1.54 9z" />
        </svg>
    )
}

function IconLinkedIn() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" style={{ width: '2cqw', height: '2cqw', flexShrink: 0 }}>
            <rect width="16" height="16" rx="3" fill="#0a66c2" />
            <path d="M4 6h2v6H4zm1-1.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM7 6h2v.85A2.5 2.5 0 0 1 11.5 6C13 6 13 7.5 13 8.5V12h-2V9c0-.75-.25-1.5-1-1.5S9 8 9 9v3H7z" fill="white" />
        </svg>
    )
}

function IconMoreHoriz() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '3cqw', height: '3cqw' }}>
            <path d="M6 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm8 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm8 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
        </svg>
    )
}

const engageBtn: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.6cqw',
    padding: '0.4cqw 0.6cqw',
    borderRadius: '0.5cqw',
    fontSize: '1.6cqw',
    fontWeight: 600,
    color: '#666',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    fontFamily: 'inherit',
}

export default function LinkedInPost({ likes, comments, reposts, children }: Props) {
    return (
        <div style={{
            width: '100%',
            height: '100%',
            background: '#f3f2ef',
            containerType: 'inline-size',
            display: 'flex',
            alignItems: 'flex-start',
            padding: '2%',
            boxSizing: 'border-box',
            fontFamily,
        }}>
            {/* Card */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.6cqw',
                width: '100%',
                height: '100%',
                background: '#ffffff',
                border: '1px solid rgba(0,0,0,0.12)',
                borderRadius: '0.8cqw',
                overflow: 'hidden',
                padding: '2cqw'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '1.2cqw' }}>
                    <img
                        src={staticFile('gilad.jpeg')}
                        style={{
                            width: '10cqw',
                            aspectRatio: 1,
                            borderRadius: '50%',
                            background: '#c0c0c0',
                            flexShrink: 0,
                        }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2cqw', flex: 1 }}>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.5cqw' }}>
                            <span style={{ fontWeight: 600, fontSize: '2.3cqw' }}>Gilad Kutiel</span>
                            <IconLinkedIn />
                            <span style={{ fontSize: '1.8cqw', color: '#6b6b6b' }}>• You</span>
                        </div>
                        <div style={{ fontSize: '1.8cqw', color: '#6b6b6b' }}>
                            PhD | Machine Learning | ex-Google, Facebook, Amazon
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', fontSize: '1.8cqw', color: '#6b6b6b', gap: '0.4cqw' }}>
                            <span>18h</span>
                            <span>•</span>
                            <IconGlobe />
                        </div>
                    </div>
                    <button style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#666',
                        padding: '0.4cqw',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <IconMoreHoriz />
                    </button>
                </div>

                {/* Content */}
                <div style={{
                    fontSize: '2.5cqw',
                    flexGrow: 1,
                    flexShrink: 1,
                    minHeight: 0,
                    overflow: 'hidden',
                }}>{children}</div>


                {/* Action bar */}
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1.5cqw', padding: '0 1cqw 1.6cqw' }}>
                    <div style={{ borderTop: '1px solid #e0e0e0' }} />
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.25cqw' }}>
                        <img
                            src={staticFile('gilad.jpeg')}
                            style={{ width: '4cqw', height: '4cqw', borderRadius: '50%', flexShrink: 0 }}
                        />
                        <svg viewBox="0 0 10 6" fill="#666" style={{ width: '1.5cqw', height: '0.9cqw' }}>
                            <path d="M0 0l5 6 5-6z" />
                        </svg>
                    </div>
                    <button style={engageBtn}>
                        <IconThumbsUp />
                        {likes != null && likes}
                    </button>
                    <button style={engageBtn}>
                        <IconComment />
                        {comments != null && comments}
                    </button>
                    <button style={engageBtn}>
                        <IconRepost />
                        {reposts != null && reposts}
                    </button>
                    <button style={engageBtn}><IconSend /></button>
                </div>
            </div>
        </div>
    )
}
