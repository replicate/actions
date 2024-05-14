import {
  existsSync as fsExistsSync,
  rm as fsRm,
} from "node:fs";
import { getInput, getBooleanInput, setFailed, notice } from "@actions/core";
import { errorMessage } from "@google-github-actions/actions-utils/dist";

export async function run() {
  try {
    const dest_dir = getInput("dest_dir");
    const delete_dest_dir = getBooleanInput("delete_dest_dir");

    deleteDirectory(delete_dest_dir, dest_dir);

  } catch (err) {
    const msg = errorMessage(err);
    setFailed(`replicate-actions/sops-decrypt post failed with: ${msg}`);
  }
}

function deleteDirectory(deleteDestDir: boolean, destDir: string): void {
  if (!deleteDestDir) {
    notice(`Skipping deletion of ${destDir}.`);
    return;
  }
  if (fsExistsSync(destDir)) {
    try {
      fsRm(destDir, { recursive: true, force: true }, () => {});
      notice(`Secrets output directory ${destDir} has been removed.`);
    } catch (err) {
      throw Error(`Error removing output directory ${destDir} with ${err}`);
    }
  } else {
    throw Error(`${destDir} does not exist`);
  }
}

if (require.main === module) {
  run().catch((err) => {
    setFailed(err.message);
  });
}