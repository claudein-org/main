import { css } from "../styled-system/css"

export const row = css({ display: "flex", flexDirection: "row" })
export const col = css({ display: "flex", flexDirection: "column" })

export const align = {
    start: css({ alignItems: "flex-start" }),
    center: css({ alignItems: "center" }),
    end: css({ alignItems: "flex-end" }),
}

export const justify = {
    start: css({ justifyContent: "flex-start" }),
    center: css({ justifyContent: "center" }),
    end: css({ justifyContent: "flex-end" }),
    between: css({ justifyContent: "space-between" }),
}

export const gap = {
    xs: css({ gap: "0.35rem" }),
    sm: css({ gap: "1rem" }),
    md: css({ gap: "1.25rem" }),
    lg: css({ gap: "1.5rem" }),
    xl: css({ gap: "2.5rem" }),
}

export const textAlign = {
    center: css({ textAlign: "center" }),
}

export const width = {
    full: css({ width: "100%" }),
    content: css({ width: "100%", maxWidth: "552px" }),
    400: css({ width: "min(400px, 100%)" }),
}

export const grow = css({ flexGrow: 1 })

export const pageCentered = css({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
    gap: "2.5rem",
    padding: "2rem",
})

export const wrap = css({ flexWrap: "wrap" })

