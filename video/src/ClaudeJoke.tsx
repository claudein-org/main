import { AbsoluteFill } from "remotion"
import ClaudeCode from "./ClaudeCode"

interface Props {
    q: string
    a: string
}
export function ClaudeJoke({ q, a }: Props) {
    return <AbsoluteFill>
        <ClaudeCode>
            {/*  
     TODO:
     This is a template for a question and answer joke.
     - Type the question
     - Animate claude thinking, meanwhile animate the context, tokens and spending increasing (exaggerate the numbers)
     - then type the answer and animate claude laughing
        */}
        </ClaudeCode>
    </AbsoluteFill>
}