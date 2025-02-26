"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "../_trpc/client";
import { useEffect, Suspense } from "react";
import { Loader2 } from "lucide-react";

const PageContent = () => {
  const router = useRouter();

  const searchParams = useSearchParams();
  const origin = searchParams.get("origin");

  const { data, error } = trpc.authCallback.useQuery(undefined, {
    retry: true,
    retryDelay: 500,
  });

  useEffect(() => {
    if (data) {
      const { success } = data;
      if (success) {
        if (success) {
          router.push(origin ? `/${origin}` : "/dashboard");
        }
      }
    } else if (error) {
      if (error.data?.code === "UNAUTHORIZED") {
        router.push("/sign-in");
      }
    }
  }, [data, origin, router, error]);

  return (
    <div className="w-full mt-24 flex justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
        <h3 className="font-semibold text-xl">Setting up the account...</h3>
        <p>You will be redirected automatically</p>
      </div>
    </div>
  );
};

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  );
};

export default Page;
