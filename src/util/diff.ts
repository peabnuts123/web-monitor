import { exec } from 'child_process';

const execAsync = async (cmd: string): Promise<[number, string, string]> => {
  return new Promise((resolve) => {
    let stdout: string;
    let stderr: string;

    const process = exec(cmd, (err, _stdout, _stderr) => {
      // if (err) {
      //   reject(err);
      // } else {
      stdout = _stdout;
      stderr = _stderr;
      // }
    });

    process.on('close', (code) => {
      if (code === null) {
        throw new Error("exec() interrupted");
      }

      resolve([code, stdout, stderr]);
    });
  });
};

export interface DiffResult {
  different: boolean;
  diff?: string;
}

export default async function diff(pathA: string, pathB: string, label: string): Promise<DiffResult> {
  const [exitCode, stdout, stderr] = await execAsync(`diff -u --label '${label}' --label '${label}' '${pathA}' '${pathB}'`);

  if (exitCode === 0) {
    // Files are the same
    return {
      different: false,
    };
  } else if (exitCode === 1) {
    // Files are different
    return {
      different: true,
      diff: stdout,
    };
  } else {
    // Unknown error
    throw new Error("An unknown error occurred while performing diff: " + stderr);
  }
}
