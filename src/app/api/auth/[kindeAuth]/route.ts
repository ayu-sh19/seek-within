import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: any) {
  const locale = await params;
  const endpoint = locale.kindeAuth;
  return handleAuth(request, endpoint);
}
