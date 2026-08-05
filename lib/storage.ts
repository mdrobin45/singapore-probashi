export async function uploadScreenshot(file: File): Promise<string> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Storage not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Screenshot must be under 5 MB.");
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const res = await fetch(`${supabaseUrl}/storage/v1/object/screenshots/${filename}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": file.type || "image/jpeg",
    },
    body: await file.arrayBuffer(),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`Upload failed: ${msg}`);
  }

  return `${supabaseUrl}/storage/v1/object/public/screenshots/${filename}`;
}
