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

// 输出当前目录（不一定是代码所在的目录）下的文件和文件夹
exec(cmd, (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
});
