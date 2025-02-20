import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { buttonVariants } from "./ui/button";
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/server";
import { ArrowRight } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-100 ">
          <Link href="/" className="flex z-40 font-bold">
            <span className="text-2xl">
              seek <sup className="font-semibold">within</sup>
            </span>
          </Link>
          {/* Add Mobile Navbar*/}
          <div className="hidden items-center space-x-4 sm:flex ">
            <>
              <Link
                href="/pricing"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                <span className="font-semibold text-xl">Pricing</span>
              </Link>
              <LoginLink
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                <span className="font-semibold text-xl">Sign In</span>
              </LoginLink>
              <RegisterLink className={buttonVariants({ size: "sm" })}>
                <span className="font-semibold text-xl">Get Started</span>
                <ArrowRight className="h-5 w-5" />
              </RegisterLink>
            </>
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};
export default Navbar;
