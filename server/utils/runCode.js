const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { promisify } = require("util");

const execAsync = promisify(exec);
const TEMP_DIR = path.join(__dirname, "..", "temp");
const TIMEOUT_MS = 15000;
const USE_DOCKER = process.env.USE_DOCKER === "true";
const DOCKER_IMAGE = process.env.DOCKER_IMAGE || "rce-cpp-sandbox";

function dockerVolumePath(dir) {
  const resolved = path.resolve(dir);
  if (process.platform === "win32") {
    return resolved.replace(/\\/g, "/");
  }
  return resolved;
}

function buildDockerCommand(runId) {
  const source = process.env.DOCKER_VOLUME_NAME || dockerVolumePath(TEMP_DIR);
  const mount = `${source}:/code`;
  return `docker run --rm -i --network none --memory 128m --cpus 0.5 -v "${mount}" ${DOCKER_IMAGE} bash -c "g++ /code/${runId}/runner.cpp -o /code/${runId}/runner.out 2>&1 && /code/${runId}/runner.out < /code/${runId}/in.txt 2>&1"`;
}

function buildLocalCommand(runId) {
  if (process.platform === "win32") {
    return `g++ temp\\${runId}\\runner.cpp -o temp\\${runId}\\runner.exe 2>&1 && temp\\${runId}\\runner.exe < temp\\${runId}\\in.txt 2>&1`;
  }
  return `g++ ./temp/${runId}/runner.cpp -o ./temp/${runId}/runner.out 2>&1 && ./temp/${runId}/runner.out < ./temp/${runId}/in.txt 2>&1`;
}

async function runCode(code, input = "") {
  const runId = Date.now() + "_" + Math.random().toString(36).substring(2, 9);
  const runDir = path.join(TEMP_DIR, runId);

  await fs.promises.mkdir(runDir, { recursive: true });
  await fs.promises.writeFile(path.join(runDir, "runner.cpp"), code);
  await fs.promises.writeFile(path.join(runDir, "in.txt"), input || "");

  const command = USE_DOCKER ? buildDockerCommand(runId) : buildLocalCommand(runId);
  const cwd = path.join(__dirname, "..");

  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd,
      timeout: TIMEOUT_MS,
      maxBuffer: 1024 * 1024,
      shell: true,
    });

    const errText = (stderr || "").trim();
    if (errText) {
      return { status: 201, body: "Runtime Error: " + errText };
    }
    return { status: 200, body: stdout || "" };
  } catch (err) {
    const output = err.stderr || err.stdout || err.message || "Execution failed";
    if (/error:|compilation/i.test(output)) {
      return { status: 500, body: "Compilation error:\n" + output };
    }
    return { status: 500, body: String(output) };
  } finally {
    try {
      await fs.promises.rm(runDir, { recursive: true, force: true });
    } catch (cleanupErr) {
      console.error(`Failed to clean up run directory ${runDir}:`, cleanupErr);
    }
  }
}

module.exports = { runCode, USE_DOCKER, DOCKER_IMAGE };
