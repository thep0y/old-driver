/**
 * @author   thepoy
 * @file     upx.js
 * @created  2023-03-12 16:43:40
 * @modified 2023-03-12 16:43:40
 */

import { exec } from "child_process";

let cmd = "upx -9 src-tauri/target/release/old-driver";

if (process.platform === "win32") {
  cmd += ".exe";
}

exec(cmd, (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
});
