import fs from "node:fs";

try {
  fs.rmSync(".next", { recursive: true, force: true });
} catch {
  // ignore
}

