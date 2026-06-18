const { spawnSync } = require("node:child_process");

const maxAttempts = Number.parseInt(process.env.PRISMA_DEPLOY_MAX_ATTEMPTS ?? "5", 10);
const delayMs = Number.parseInt(process.env.PRISMA_DEPLOY_RETRY_MS ?? "5000", 10);
const retryableErrorCodes = ["P1001", "P1002"];
const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function runMigrateDeploy() {
  return spawnSync(npxCommand, ["prisma", "migrate", "deploy"], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: process.env
  });
}

function isRetryable(output) {
  return retryableErrorCodes.some((code) => output.includes(code));
}

async function main() {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    console.log(`Running Prisma migrate deploy (attempt ${attempt}/${maxAttempts})`);
    const result = runMigrateDeploy();
    const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;

    if (result.stdout) {
      process.stdout.write(result.stdout);
    }

    if (result.stderr) {
      process.stderr.write(result.stderr);
    }

    if (result.status === 0) {
      console.log("Prisma migrations applied successfully.");
      return;
    }

    if (attempt < maxAttempts && isRetryable(output)) {
      console.warn(`Prisma database connection failed with a retryable error. Retrying in ${delayMs}ms...`);
      await sleep(delayMs);
      continue;
    }

    process.exit(result.status ?? 1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
