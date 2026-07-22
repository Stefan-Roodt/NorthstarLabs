import { existsSync } from "node:fs";
import { execFileSync, execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const moduleNumbers = ["1-1", "1-2", "1-3", "1-4", "1-5", "1-6", "1-7", "1-8", "1-9"];

const commands = [];
const failedCommands = [];

for (const moduleNumber of moduleNumbers) {
  const premiumGenerator = resolve(__dirname, `generate-module-${moduleNumber}-premium.mjs`);
  if (existsSync(premiumGenerator)) {
    commands.push({ cmd: "node", args: [premiumGenerator], label: `premium generator ${moduleNumber}` });
  }
}

for (const moduleNumber of moduleNumbers) {
  const mediaScript = resolve(__dirname, `generate-module-${moduleNumber}-media.ps1`);
  if (existsSync(mediaScript)) {
    commands.push({
      cmd: "powershell",
      args: ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", mediaScript],
      label: `media script ${moduleNumber}`,
    });
  }
}

const mapScript = resolve(__dirname, "generate-module-1-4-cryptocurrency-map.py");
if (existsSync(mapScript)) {
  const runtimePython = resolve(
    process.env.USERPROFILE ?? "",
    ".cache",
    "codex-runtimes",
    "codex-primary-runtime",
    "dependencies",
    "python",
    "python.exe",
  );
  const pythonCommand = existsSync(runtimePython)
    ? runtimePython
    : process.platform === "win32"
      ? "python"
      : "python3";
  commands.push({ cmd: pythonCommand, args: [mapScript], label: "module 1.4 design map" });
}

for (const command of commands) {
  try {
    if (command.cmd === "powershell") {
      execFileSync(command.cmd, command.args, { stdio: "inherit" });
    } else {
      execSync([command.cmd, ...command.args].map((arg) => JSON.stringify(arg)).join(" "), {
        cwd: __dirname,
        stdio: "inherit",
        shell: true,
      });
    }
  } catch (error) {
    failedCommands.push({ label: command.label, error: String(error.message || error) });
    console.error(`Skipping after failure in ${command.label}; continuing with remaining commands.`);
    continue;
  }

  console.log(`Executed ${command.label}`);
}

// Final guard: keep the migration matrix and schema checks aligned after pipeline run.
try {
  execSync("node scripts/validate-migrations.mjs", {
    cwd: projectRoot,
    stdio: "inherit",
    shell: true,
  });
} catch (error) {
  failedCommands.push({ label: "node scripts/validate-migrations.mjs", error: String(error.message || error) });
}

if (failedCommands.length > 0) {
  console.error("Completed with warnings:");
  for (const item of failedCommands) {
    console.error(` - ${item.label}`);
    console.error(`   ${item.error}`);
  }
  process.exitCode = 1;
} else {
  console.log("Pipeline completed successfully.");
}
