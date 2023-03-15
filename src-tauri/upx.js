/**
 * @author   thepoy
 * @file     upx.js
 * @created  2023-03-12 16:43:40
 * @modified 2023-03-12 16:43:40
 */

import os from "os";
import { exec, execSync } from "child_process";
import path from "path";

function downloadFileAsync(uri, dest) {
  return new Promise((resolve, reject) => {
    // 确保dest路径存在
    const file = fs.createWriteStream(dest);

    http.get(uri, (res) => {
      if (res.statusCode !== 200) {
        reject(response.statusCode);
        return;
      }

      res.on("end", () => {
        console.log("download end");
      });

      // 进度、超时等

      file
        .on("finish", () => {
          console.log("finish write file");
          file.close(resolve);
        })
        .on("error", (err) => {
          fs.unlink(dest);
          reject(err.message);
        });

      res.pipe(file);
    });
  });
}

function cmdExists(cmd) {
  try {
    execSync(
      os.platform() === "win32"
        ? `cmd /c "(help ${cmd} > nul || exit 0) && where ${cmd} > nul 2> nul"`
        : `command -v ${cmd}`
    );
    return true;
  } catch {
    return false;
  }
}

function excecute(cmd) {
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
}

async function compress() {
  let cmd;
  if (cmdExists("upx")) {
    cmd = "upx";
    console.log("使用系统已安装的 upx 命令");
  } else {
    console.log("环境变量中未找到 upx ，即将自动下载");
    let url;
    if (process.env.GITHUB_MIRROR) {
      url = process.env.GITHUB_MIRROR;
    } else {
      url = "https://github.com";
    }

    let version;
    if (process.env.UPX_VERSION) {
      version = process.env.UPX_VERSION;
    } else {
      version = "4.0.2";
    }

    const temp_dir = os.tmpdir();

    url = `${url}/upx/upx/releases/download/v${version}/upx-`;

    switch (os.platform()) {
      case "darwin":
        console.error("macOS 不支持自动下载 upx");
        return;
      case "win32":
        const arch = os.arch();
        if (arch === "ia32") {
          url += `${version}-win32.zip`;
        } else if (arch === "x64") {
          url += `${version}-win64.zip`;
        } else {
          console.error("当前 cpu 架构不支持自动下载 upx：", arch);
          return;
        }

        const temp_file = path.join(temp_dir, "upx.zip")

        await downloadFileAsync(url, temp_file);

        excecute(`expand ${temp_file} -f:* ${temp_dir}`)

        cmd = path.join(temp_dir, "upx.exe")

        break;
      case "linux":
        console.error("linux 尚未支持自动下载 upx");
        return;
    }

  }

  excecute(cmd)
}

compress()
