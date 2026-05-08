import { v4 as uuid } from "uuid";

export const uploadToStorage = async (
  file: File,
  buffer: Buffer,
  supabase: ReturnType<typeof import("@supabase/ssr").createServerClient>,
) => {
  const filePath = `documents/${uuid()}-${file.name}`;

  const { error } = await supabase.storage
    .from("documents")
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from("documents").getPublicUrl(filePath);

  return {
    path: filePath,
    bucket: "documents",
    url: data.publicUrl,
  };
};
