<template>
  <el-upload
    id="select-files"
    drag
    disabled
    @click="select"
  >
    <div>
      <el-icon class="el-icon--upload">
        <i-ep-upload-filled />
      </el-icon>

      <div class="el-upload__text">
        拖拽文件（图片或 PDF文档）到此程序
      </div>
    </div>
  </el-upload>
</template>

<script setup lang="ts">
import { listen } from '@tauri-apps/api/event'
import { useRouter } from 'vue-router'
import { Routes } from '~/lib'

const router = useRouter()

const select = () => {
  // TODO: tauri 打开文件管理器
  console.log('tauri 打开文件管理器选择多个文件')
}

listen<FilePath[]>('tauri://file-drop', async event => {
  router.push({
    name: Routes.ImageList.name,
    params: {
      fileList: event.payload
    }
  })
})
</script>

<style lang="scss">
#select-files {
  height: 100%;
  overflow: hidden;

  .el-upload.is-drag {
    height: calc(100% - 40px);
    margin: 20px;
  }

  .el-upload-dragger {
    display: flex;
    width: 100%;
    height: 100%;

    >div{
      width: 100%;
      align-self: center;
    }
  }

}
</style>
