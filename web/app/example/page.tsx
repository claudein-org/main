import Demo from '@/component/Demo'
import { align, col, justify, width } from '@/css/layout.css'
import { cx } from '@/styled-system/css/cx'

export default function page() {
    return <main className={cx(width.full, col, align.center, justify.center)}>
        <Demo />
    </main>
}