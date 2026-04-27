import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const repoRoot = path.resolve(root, "..");
const packagePath = path.join(root, "package.json");
const envPath = path.join(root, ".env");
const changelogPath = path.join(repoRoot, "CHANGELOG.md");
const versionConfigPath = path.join(root, "src", "config", "version.js");

const type = process.argv[2] || "patch";
const allowedTypes = ["patch", "minor", "major"];

if (!allowedTypes.includes(type)) {
  console.error(`Invalid version type "${type}". Use patch, minor or major.`);
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const nextVersion = bump(pkg.version || "0.0.0", type);

pkg.version = nextVersion;
fs.writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);

writeEnvVersion(nextVersion);
writeVersionConfig(nextVersion);
writeChangelog(nextVersion);

console.log(`Version bumped to ${nextVersion}`);

function bump(version, bumpType) {
  const parts = version.split(".").map((part) => Number(part));
  const [major = 0, minor = 0, patch = 0] = parts;

  if (bumpType === "major") return `${major + 1}.0.0`;
  if (bumpType === "minor") return `${major}.${minor + 1}.0`;

  const nextPatch = patch + 1;
  if (nextPatch > 9) return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${nextPatch}`;
}

function writeEnvVersion(version) {
  const line = `VITE_APP_VERSION=${version}`;

  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, `${line}\n`);
    return;
  }

  const env = fs.readFileSync(envPath, "utf8");
  const nextEnv = env.match(/^VITE_APP_VERSION=/m)
    ? env.replace(/^VITE_APP_VERSION=.*/m, line)
    : `${env.trimEnd()}\n${line}\n`;

  fs.writeFileSync(envPath, nextEnv.endsWith("\n") ? nextEnv : `${nextEnv}\n`);
}

function writeVersionConfig(version) {
  const content = `export const VERSION =
  typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : import.meta.env.VITE_APP_VERSION || "${version}";
`;
  fs.writeFileSync(versionConfigPath, content);
}

function writeChangelog(version) {
  const entry = `## v${version}\n\n* Update release notes\n\n`;

  if (!fs.existsSync(changelogPath)) {
    fs.writeFileSync(changelogPath, `# Changelog\n\n${entry}`);
    return;
  }

  const changelog = fs.readFileSync(changelogPath, "utf8");
  if (changelog.includes(`## v${version}`)) return;

  const nextChangelog = changelog.startsWith("# Changelog")
    ? changelog.replace("# Changelog\n\n", `# Changelog\n\n${entry}`)
    : `# Changelog\n\n${entry}${changelog}`;

  fs.writeFileSync(changelogPath, nextChangelog);
}
