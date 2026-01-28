const CLOUD_NAME = "djtjixlhw";
const UPLOAD_PRESET = "portfolio_unsigned";

export async function uploadToCloudinary(file, folder = "portfolio") {
  if (!file) return null;

   const isPDF = file.type === "application/pdf";
  const resourceType = isPDF ? "raw" : "auto";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", folder);

const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
    {
      method: "POST",
      body: formData
    }
  );

  const data = await res.json();

  if (!res.ok) {
    console.error("❌ Cloudinary upload failed:", data);
    throw new Error("Cloudinary upload error");
  }

  console.log("☁️ Uploaded to Cloudinary:", data.secure_url);

  return {
    url: data.secure_url,
    public_id: data.public_id
  };
}

