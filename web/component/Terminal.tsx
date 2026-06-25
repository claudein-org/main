import { terminal, terminalBody, terminalDot, terminalDotGreen, terminalDotRed, terminalDotYellow, terminalHeader } from "@/css/style.css"
import { cx } from "@/styled-system/css"

interface Props {
    children?: React.ReactNode
}
export default function Terminal({ children }: Props) {
    return <div className={terminal}>
        <div className={terminalHeader}>
            <div className={cx(terminalDot, terminalDotRed)} />
            <div className={cx(terminalDot, terminalDotYellow)} />
            <div className={cx(terminalDot, terminalDotGreen)} />
        </div>
        <div className={terminalBody}>
            {children}
        </div>
    </div>

}