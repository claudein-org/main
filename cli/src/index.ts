#!/usr/bin/env node

const WEB_URL = "https://claudein.org";

async function main() {
  const { default: open } = await import("open");
  console.log("Opening browser for LinkedIn authentication...");
  await open(`${WEB_URL}/auth/login`);
  console.log(`Visit ${WEB_URL} to download your access token.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
