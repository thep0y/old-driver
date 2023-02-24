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
import type { UploadProps, UploadUserFile } from 'element-plus'

defineProps({
  fileList: {
    type: Array as PropType<UploadUserFile[]>,
    required: true
  }
})

const handleRemove: UploadProps['onRemove'] = (uploadFile, uploadFiles) => {
  console.log(uploadFile, uploadFiles)
}

const handlePictureCardPreview: UploadProps['onPreview'] = async (uploadFile) => {
  await open('C:\\Users\\thepoy\\Pictures\\截图\\微信截图_20220617152552.png')
  await open('http://google.com')
}
</script>
