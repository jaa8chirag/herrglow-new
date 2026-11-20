import { listActiveServices } from "@herrglow/core";

export async function GET() {
  const services = await listActiveServices();
  return Response.json({ ok: true, services: services.length });
}
