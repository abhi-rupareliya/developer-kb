import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 });
    }

    // Get document metadata
    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .single();

    if (docError) {
      console.error("Document lookup error:", docError);
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Download file from storage
    const { data, error } = await supabase.storage
      .from(document.storage_bucket)
      .download(document.storage_path);

    if (error) {
      console.error("Storage download error:", error);
      return NextResponse.json({ error: "Failed to download file from storage" }, { status: 404 });
    }

    if (!data) {
      return NextResponse.json({ error: "File is empty" }, { status: 404 });
    }

    // Convert blob to buffer
    const buffer = Buffer.from(await data.arrayBuffer());

    // Return file with appropriate headers
    const headers = new Headers();
    headers.set('Content-Type', document.mime_type || 'application/octet-stream');
    headers.set('Content-Disposition', `inline; filename="${document.original_file_name}"`);
    headers.set('Cache-Control', 'private, max-age=3600');
    headers.set('Access-Control-Allow-Origin', '*');

    return new NextResponse(buffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error serving document:', error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}