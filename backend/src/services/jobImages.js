import fs from "node:fs";
import path from "node:path";
import { getJobImagesDirectoryPath } from "../db/database.js";
import { createId } from "./ids.js";

const SUPPORTED_IMAGE_TYPES = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"]
]);

function sanitizeOriginalFileName(fileName) {
  return String(fileName || "job-image")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "job-image";
}

export function getSupportedImageMimeTypes() {
  return [...SUPPORTED_IMAGE_TYPES.keys()];
}

export function getJobImagePublicUrl(imagePath) {
  return imagePath ? `/api/job-images/${encodeURIComponent(imagePath)}` : null;
}

export function resolveJobImageFilePath(imagePath) {
  if (!imagePath) {
    return null;
  }

  return path.join(getJobImagesDirectoryPath(), path.basename(imagePath));
}

export function jobImageExists(imagePath) {
  const filePath = resolveJobImageFilePath(imagePath);
  return Boolean(filePath && fs.existsSync(filePath));
}

export function removeStoredJobImage(imagePath) {
  const filePath = resolveJobImageFilePath(imagePath);
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export function saveJobImageUpload({ jobId, fileName, mimeType, base64Data }) {
  if (!base64Data || typeof base64Data !== "string") {
    throw new Error("Image upload is missing file data.");
  }

  const extension = SUPPORTED_IMAGE_TYPES.get(String(mimeType || "").toLowerCase());
  if (!extension) {
    throw new Error(`Unsupported image type. Supported formats: ${getSupportedImageMimeTypes().join(", ")}.`);
  }

  let buffer;
  try {
    buffer = Buffer.from(base64Data, "base64");
  } catch {
    throw new Error("Image upload data is invalid.");
  }

  if (!buffer.length) {
    throw new Error("Image upload data is empty.");
  }

  const storedFileName = `${jobId}-${createId("img")}${extension}`;
  const filePath = path.join(getJobImagesDirectoryPath(), storedFileName);
  fs.writeFileSync(filePath, buffer);

  return {
    imagePath: storedFileName,
    imageFileName: sanitizeOriginalFileName(fileName)
  };
}
