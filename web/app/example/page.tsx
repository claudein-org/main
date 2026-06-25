import ClaudeCode from '@/component/ClaudeCode'
import LinkedInPost from '@/component/LinkedInPost'
import { align, col, justify, width } from '@/css/layout.css'
import { cx } from '@/styled-system/css/cx'
import { z } from 'zod'

const Params = z.object({
})

interface Params {
    params: Promise<z.infer<typeof Params>>
}

export default async function page({ params }: Params) {
    return <main className={cx(width.full, col, align.center, justify.center)}>
        <ClaudeCode />
        <div style={{ height: 100 }}></div>
        <LinkedInPost likes={10} comments={12} reposts={3}>

        </LinkedInPost>
    </main>
}