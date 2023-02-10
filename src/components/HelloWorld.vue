<template>
  <el-upload
    v-model:file-list="fileList"
    list-type="picture-card"
    :on-preview="handlePictureCardPreview"
    :on-remove="handleRemove"
    :auto-upload="false"
    :drag="false"
    multiple
  >
    <template #tip>
      提示文字
    </template>
    <i-ep-plus />
  </el-upload>

  <el-dialog v-model="dialogVisible">
    <img
      w-full
      :src="dialogImageUrl"
      alt="查看图片"
    >
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { UploadProps, UploadUserFile } from 'element-plus'

const fileList = ref<UploadUserFile[]>([])

const dialogImageUrl = ref('')
const dialogVisible = ref(false)

const handleRemove: UploadProps['onRemove'] = (uploadFile, uploadFiles) => {
  console.log(uploadFile, uploadFiles)
}

const handlePictureCardPreview: UploadProps['onPreview'] = (uploadFile) => {
  dialogImageUrl.value = uploadFile.url!
  dialogVisible.value = true
}
</script>