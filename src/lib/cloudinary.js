// src/lib/cloudinary.js
// Cloudinary 이미지 업로드 유틸
// .env.local에 아래 두 줄 추가 필요:
// VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
// VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

const CLOUD_NAME   = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * 이미지 파일을 Cloudinary에 업로드하고 URL 반환
 * @param {File} file
 * @returns {Promise<string>} 업로드된 이미지 URL
 */
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", "lifetool/community");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) throw new Error("이미지 업로드 실패");
  const data = await res.json();
  return data.secure_url;
}
