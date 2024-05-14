import { execSync } from "node:child_process";
import {
  existsSync as fsExistsSync,
  mkdirSync as fsMkdirSync,
  readdirSync as fsReaddirSync,
} from "node:fs";
import {join as pathjoin, isAbsolute as isAbsolutePath} from "node:path";
import { getBooleanInput, getInput, setFailed, notice } from "@actions/core";
import { errorMessage } from "@google-github-actions/actions-utils/dist";

interface config {
    source_dir: string;
    dest_dir: string;
    file_pattern: string;
    create_dest_dir: boolean;
}

export async function run() {
  try {
    // load configuration
    const config = {
      source_dir: pathjoin(process.cwd(), getInput("source_dir")),
      dest_dir: pathjoin(process.cwd(), getInput("dest_dir")),
      file_pattern: getInput("file_pattern"),
      create_dest_dir: getBooleanInput("create_dest_dir")
    }

    // add validation
    if (!isAbsolutePath(config.source_dir)) throw Error(`Invalid source directory ${config.source_dir}`);
    if (!isAbsolutePath(config.dest_dir)) throw Error(`Invalid destination directory ${config.dest_dir}`);

    runSopsDecryption(config);
  } catch (err) {
    const msg = errorMessage(err);
    setFailed(`replicate-actions/sops-decrypt failed with: ${msg}`);
  }
}

function runSopsDecryption(config: config): void {
  // Check if the source directory exists
  const { source_dir, dest_dir, file_pattern, create_dest_dir } = config;
  if (!fsExistsSync(source_dir)) {
    throw Error(`Source directory ${source_dir} does not exist.`);
  }
  // Create the destination directory if it doesn't exist
  if (create_dest_dir && !fsExistsSync(dest_dir)) {
    fsMkdirSync(dest_dir, { recursive: true });
  }
  // Get the list of files in the source directory that match the file pattern
  console.error(`source_dir: ${source_dir}`)
  console.error(`dest_dir: ${dest_dir}`)
  console.error(`file_pattern: ${file_pattern}`)
  console.error(`files: ${fsReaddirSync(source_dir)}`)
  console.error(`filtered_files: ${fsReaddirSync(source_dir).filter((file) => file.match(file_pattern))}`)
  const files = fsReaddirSync(source_dir).filter((file) => file.match(file_pattern));
  // Execute command on each file
  for (const file of files) {
    console.error(`file: ${file}`);
    const filePath = pathjoin(source_dir, file);
    const destPath = pathjoin(dest_dir, file);

    if (!fsExistsSync(filePath)) {
      throw Error(`File ${filePath} does not exist.`);
    }

    // defining the command separately
    const command = `sops -d ${filePath} > ${destPath}`;

    try {
      execSync(command);
      notice(`Successfully decrypted file: ${filePath}`);
    } catch (err) {
      throw Error(`Error decrypting ${filePath} with error ${err}`);
    }
  }
}

if (require.main === module) {
  run().catch((err) => {
    setFailed(err.message);
  });
}