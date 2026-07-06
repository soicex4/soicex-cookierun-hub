// ตั้งค่า Cloudinary สำหรับอัปโหลดสกรีนช็อต (unsigned upload — ไม่ต้องมี server)
export const CLOUDINARY_CLOUD_NAME = "unjjco2b";
export const CLOUDINARY_UPLOAD_PRESET = "cookierun-hub-uploads";

// อัปโหลดไฟล์รูปขึ้น Cloudinary ตรงจากเบราว์เซอร์ คืนค่า URL ของรูปที่อัปโหลดสำเร็จ
export async function uploadImage(file) {
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(url, { method: "POST", body: formData });
  if (!res.ok) {
    throw new Error("อัปโหลดรูปไม่สำเร็จ ลองใหม่อีกครั้ง");
  }
  const data = await res.json();
  return data.secure_url;
}
