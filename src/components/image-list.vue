<template>
  <el-upload
    :file-list="fileList"
    action="#"
    list-type="picture-card"
    :on-preview="handlePictureCardPreview"
    :on-remove="handleRemove"
  >
    <el-icon><Plus /></el-icon>
  </el-upload>
</template>

<script lang="ts" setup>
import { PropType } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { open } from '@tauri-apps/api/shell'
import type { UploadProps, UploadFile, UploadUserFile } from 'element-plus'

defineProps({
  fileList: {
    type: Array as PropType<UploadUserFile[]>,
    required: true
  }
})

interface File extends UploadFile {
  src: string;
}

const handleRemove: UploadProps['onRemove'] = (uploadFile, uploadFiles) => {
  console.log(uploadFile, uploadFiles)
}

const handlePictureCardPreview = async (uploadFile: File) => {
  await open(uploadFile.src)
  await open('http://google.com')
}
</script>
