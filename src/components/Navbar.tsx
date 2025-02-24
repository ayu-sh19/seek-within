import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { buttonVariants } from "./ui/button";
import {
  getKindeServerSession,
  LoginLink,
  RegisterLink,
} from "@kinde-oss/kinde-auth-nextjs/server";
import { ArrowRight } from "lucide-react";
import UserAccountNav from "./UserAccountNav";

const Navbar = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

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
            {!user ? (
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
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  <span className="font-semibold text-xl">Dashboard</span>
                </Link>
                <UserAccountNav
                  name={
                    !user.given_name || !user.family_name
                      ? "Your Account"
                      : `${user.given_name} ${user.family_name}`
                  }
                  email={user.email ?? ""}
                  imageUrl={user.picture ?? ""}
                />
              </>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};
export default Navbar;
