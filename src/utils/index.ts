import { readFileSync } from "fs";
import path from "path";

function readSecret(name: string) {
  return readFileSync(path.join(process.cwd(), 'secrets', name)).toString();
}

function readJsonSecret(name: string) {
  return JSON.parse(readSecret(name));
}


export { readSecret, readJsonSecret };
