import Image from "next/image"

const GITHUB_URL = "https://github.com/claudein-org/main"

export default async function page() {
  return <main>
    <div>
      <Image
        src="/logo.svg"
        alt="claudein.org"
        width={400}
        height={400}
        priority
      />
      <div>
        <h1>ClaudeIn</h1>
        <p>Coming Soon</p>
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
          <Image
            src={`https://img.shields.io/github/stars/claudein-org/main?style=social`}
            alt="GitHub Stars"
            width={90}
            height={20}
            unoptimized
          />
        </a>
      </div>
    </div>
  </main>
}
