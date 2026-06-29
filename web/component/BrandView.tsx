'use client'

import { articleBody, brandEmpty, brandPage } from "@/css/style.css"
import { proto } from "@claudein.org/common"
import Markdown from "react-markdown"

interface Props {
    brand: proto.Brand | undefined
}

export default function BrandView({ brand }: Props) {
    if (!brand) return <div className={brandEmpty}>Waiting for your brand…</div>

    return (
        <div className={brandPage}>
            <div className={articleBody}>
                <Markdown>{brand.markdown}</Markdown>
            </div>
        </div>
    )
}
