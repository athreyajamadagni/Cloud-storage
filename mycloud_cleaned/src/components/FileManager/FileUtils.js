import { FileText, Image, Video, Music, FileArchive, FileCode, File } from "lucide-react";

export function getFileIcon(type) {
  if (!type) return <File className="w-5 h-5 text-gray-500" />;
  if (type.includes("image")) return <Image className="w-5 h-5 text-blue-500" />;
  if (type.includes("video")) return <Video className="w-5 h-5 text-purple-500" />;
  if (type.includes("audio")) return <Music className="w-5 h-5 text-pink-500" />;
  if (type.includes("zip") || type.includes("tar")) return <FileArchive className="w-5 h-5 text-yellow-500" />;
  if (type.includes("text") || type.includes("pdf")) return <FileText className="w-5 h-5 text-green-500" />;
  if (type.includes("json") || type.includes("xml") || type.includes("javascript"))
    return <FileCode className="w-5 h-5 text-orange-500" />;
  return <File className="w-5 h-5 text-gray-500" />;
}

export function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
