import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { evidence } from "@/db/schema";

const evidenceSchema = z.object({
  name: z.string().trim().min(1).max(255),
  type: z.enum(["Recording", "Screenshot"]),
  durationSeconds: z.number().int().nonnegative().nullable().optional(),
  sizeBytes: z.number().int().nonnegative().nullable().optional(),
  folderId: z.string().max(255).nullable().optional(),
  metadataJson: z.string().max(10000).nullable().optional(),
});

function currentUserId() {
  return "mock-jordan";
}

export async function GET() {
  if (!db)
    return Response.json(
      { error: "Database is not configured" },
      { status: 503 },
    );
  const rows = await db
    .select()
    .from(evidence)
    .where(eq(evidence.userId, currentUserId()))
    .limit(100);
  return Response.json({ data: rows });
}

export async function POST(request: Request) {
  if (!db)
    return Response.json(
      { error: "Database is not configured" },
      { status: 503 },
    );
  const parsed = evidenceSchema.safeParse(await request.json());
  if (!parsed.success)
    return Response.json(
      { error: "Invalid evidence payload" },
      { status: 400 },
    );
  const id = crypto.randomUUID();
  await db.insert(evidence).values({
    id,
    userId: currentUserId(),
    name: parsed.data.name,
    type: parsed.data.type,
    durationSeconds: parsed.data.durationSeconds ?? null,
    sizeBytes: parsed.data.sizeBytes ?? null,
    folderId: parsed.data.folderId ?? null,
    metadataJson: parsed.data.metadataJson ?? null,
    uploadStatus: "saved",
  });
  return Response.json({ data: { id } }, { status: 201 });
}
