import { NextRequest, NextResponse } from "next/server";

import { validateFile } from "@/lib/upload/validators";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { uploadToStorage } from "@/lib/supabase/storage";
import { parseFileByType } from "@/lib/upload/parser";
import { inngest } from "@/lib/inngest";
import { PROCESSING_STATUS } from "@/constants/Uploads";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const cookieStore = await cookies();

    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const supabase = createClient(cookieStore);

    const results = [];

    for (const file of files) {
      validateFile(file);

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      // extract text
      const parsed = await parseFileByType(file, buffer);

      // upload original file
      const uploaded = await uploadToStorage(file, buffer, supabase);

      // save db record
      const { data, error } = await supabase
        .from("documents")
        .insert({
          user_id: "03612923-6932-44f0-ad47-5097c604426b", // Replace with actual user ID from auth context
          title: file.name,
          original_file_name: file.name,
          storage_bucket: uploaded.bucket,
          storage_path: uploaded.path,
          public_url: uploaded.url,
          mime_type: file.type,
          file_size: file.size,
          //   file_hash: null, // You can implement file hashing if needed
          upload_status: "UPLOADED",
          processing_status: PROCESSING_STATUS.PENDING,
          extracted_text: parsed.text,
          metadata: parsed.metadata ?? {},
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      await inngest.send({
        name: "document.uploaded",
        data: {
          documentId: data?.id,
        },
      });

      results.push(data);
    }

    return NextResponse.json({
      success: true,
      documents: results,
    });
  } catch (error: unknown) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
