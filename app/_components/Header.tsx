"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Menu, X } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";
import { useContext, useState } from "react";
import { UserDetailsContext } from "@/context/UserDetailsContext";
import ThemeToggle from "./ThemeToggle";

const MenuOption = [
  { name: "Workspace", path: "/workspace" },
  { name: "Pricing", path: "/pricing" },
  { name: "Contact us", path: "/contact" },
];

function Header() {
  const { userDetails } = useContext(UserDetailsContext);
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-border bg-background/80 shadow-sm backdrop-blur">
      <div className="flex justify-between items-center p-4 h-[10vh]">
        {/* Logo */}
        <div className="flex gap-2 items-center">
          <Image src="/logo.svg" alt="Logo" width={48} height={48} />
          <h2 className="font-bold text-xl">Siteon</h2>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden items-center gap-2 md:flex">
          {MenuOption.map((option) => (
            <Button key={option.name} variant="ghost" asChild>
              <Link href={option.path}>{option.name}</Link>
            </Button>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {!userDetails ? (
            <SignInButton mode="redirect" forceRedirectUrl="/workspace">
              <Button>
                Get Started <ArrowRight />
              </Button>
            </SignInButton>
          ) : (
            <Link href="/workspace">
              <Button>
                Get Started <ArrowRight />
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
          aria-label={open ? "Close menu" : "Open menu"}
          className="rounded-xl p-2 transition hover:bg-muted"
          onClick={() => setOpen(!open)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Collapsible Menu */}
      {open && (
        <div className="md:hidden flex flex-col gap-2 px-4 pb-4">
          {MenuOption.map((option) => (
            <Link
              key={option.name}
              href={option.path}
              onClick={() => setOpen(false)}
              className="py-2"
            >
              {option.name}
            </Link>
          ))}

          {!userDetails ? (
            <SignInButton mode="redirect" forceRedirectUrl="/workspace">
              <Button className="w-full mt-2">
                Get Started <ArrowRight />
              </Button>
            </SignInButton>
          ) : (
            <Link href="/workspace">
              <Button className="w-full mt-2">
                Get Started <ArrowRight />
              </Button>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;
