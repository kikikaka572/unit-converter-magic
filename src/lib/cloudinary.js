const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export async function uploadImage(file) {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(`Cloudinary 환경변수 누락 — CLOUD_NAME: ${CLOUD_NAME}, PRESET: ${UPLOAD_PRESET}`);
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", "lifetool/community");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(
      `Cloudinary 업로드 실패 (${res.status}): ${errBody?.error?.message || res.statusText}`
    );
  }

  const data = await res.json();
  return data.secure_url;
}
