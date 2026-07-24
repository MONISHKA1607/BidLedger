import { readFile, unlink } from "fs/promises";
import { v2 as cloudinary } from "cloudinary";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

const isCloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

let cloudinaryConfigured = false;
const configureCloudinary = () => {
  if (cloudinaryConfigured) return;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  cloudinaryConfigured = true;
};

const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    configureCloudinary();
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve({ public_id: result.public_id, url: result.secure_url });
      }
    );
    stream.end(buffer);
  });

/**
 * Deletes a previously stored image. No-ops for local/base64-backed
 * images (public_id doesn't map to anything to delete) and for missing
 * ids, so it's safe to call unconditionally.
 */
export const deleteUploadedFile = async (public_id) => {
  if (!public_id || !isCloudinaryConfigured()) return;
  configureCloudinary();
  await cloudinary.uploader.destroy(public_id).catch(() => {});
};

const hasValidImageSignature = (buffer, mimetype) => {
  if (mimetype === "image/png") {
    return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }
  if (mimetype === "image/jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[buffer.length - 2] === 0xff && buffer[buffer.length - 1] === 0xd9;
  }
  if (mimetype === "image/webp") {
    return buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  }
  return false;
};

export const storeUploadedFile = async (file, folder = "uploads") => {
  if (!file) {
    const err = new Error("File is required");
    err.statusCode = 400;
    throw err;
  }

  if (file.size > MAX_IMAGE_SIZE) {
    const err = new Error("Image size must be 2MB or less");
    err.statusCode = 400;
    throw err;
  }

  const buffer = file.tempFilePath
    ? await readFile(file.tempFilePath)
    : file.data;

  if (!buffer || buffer.length === 0) {
    const err = new Error("Uploaded file is empty");
    err.statusCode = 400;
    throw err;
  }

  if (!hasValidImageSignature(buffer, file.mimetype)) {
    const err = new Error("Uploaded file content does not match an allowed image format");
    err.statusCode = 400;
    throw err;
  }

  if (file.tempFilePath) {
    await unlink(file.tempFilePath).catch(() => {});
  }

  if (isCloudinaryConfigured()) {
    return uploadToCloudinary(buffer, folder);
  }

  const safeName = String(file.name || "upload")
    .replace(/[^a-z0-9._-]/gi, "-")
    .replace(/\.\.+/g, ".")
    .replace(/^[.-]+/, "")
    .replace(/-+/g, "-")
    .slice(0, 80) || "upload";

  return {
    public_id: `${folder}/${Date.now()}-${safeName}`,
    url: `data:${file.mimetype};base64,${buffer.toString("base64")}`,
  };
};
