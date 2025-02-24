import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";
// import { NextRequest } from "next/server";

/* eslint-disable @typescript-eslint/no-explicit-any */

// export async function GET(request: NextRequest, { params }) {
//   const locale = await params;
//   const endpoint = locale.kindeAuth;
//   return handleAuth(request, endpoint);
// }

export const GET = handleAuth() as any;
