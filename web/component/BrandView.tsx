'use client'

import {
    brandDescription, brandEmpty, brandFeatures, brandGallery, brandHero,
    brandLogo, brandPage, featureCard, font, galleryImg, muted, stepNum, tracking,
} from "@/css/style.css"
import { cx } from "@/styled-system/css"
import { proto } from "@claudein.org/common"

interface Props {
    brand: proto.Brand | undefined
}

function assetSrc({ mime, base64 }: proto.Asset) {
    return `data:${mime};base64,${base64}`
}

export default function BrandView({ brand }: Props) {
    if (!brand) return <div className={brandEmpty}>Waiting for your brand…</div>

    return (
        <div className={brandPage}>
            <section className={brandHero}>
                {brand.logo.base64 && (
                    <img className={brandLogo} src={assetSrc(brand.logo)} alt={`${brand.title} logo`} />
                )}
                <h1 className={cx(font.size.hero, font.weight.bold, tracking.tight)}>{brand.title}</h1>
                <p className={cx(muted, font.size.lg, brandDescription)}>{brand.description}</p>
            </section>

            {brand.features.length > 0 && (
                <section className={brandFeatures}>
                    {brand.features.map((feature, i) => (
                        <div key={i} className={featureCard}>
                            <div className={stepNum}>{i + 1}</div>
                            <span className={cx(font.size.base)}>{feature}</span>
                        </div>
                    ))}
                </section>
            )}

            {brand.images.length > 0 && (
                <section className={brandGallery}>
                    {brand.images.map((image, i) => (
                        <img key={i} className={galleryImg} src={assetSrc(image)} alt="" />
                    ))}
                </section>
            )}
        </div>
    )
}
