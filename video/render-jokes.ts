import { spawnSync } from "child_process"
import * as fs from "fs"
import * as yaml from "js-yaml"

interface Joke {
    name: string
    q: string
    a: string
}

interface JokesFile {
    jokes: Joke[]
}

const file = process.argv[2] ?? "jokes.yml"
const raw = fs.readFileSync(file, "utf8")
const { jokes } = yaml.load(raw) as JokesFile

for (const { name, q, a } of jokes) {
    const props = JSON.stringify({ q, a })
    const output = `out/ClaudeJoke-${name}.mp4`
    if (fs.existsSync(output)) {
        console.log(`\nSkipping: ${name} (already exists)`)
        continue
    }
    console.log(`\nRendering: ${name} → ${output}`)
    spawnSync(
        "bun",
        ["run", "render", "ClaudeJoke", "--props", props, "--output", output],
        { stdio: "inherit" }
    )
}

console.log("\nDone.")
