"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function SignupFormDemo() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted");
  };

  return (
    <div className="shadow-input mx-auto w-full max-w-md rounded-2xl bg-[#111217] border border-[#27272A] p-6 md:p-8">
      <h2 className="text-xl font-bold text-zinc-100">
        Welcome to Aceternity
      </h2>
      <p className="mt-2 max-w-sm text-xs text-zinc-400 font-semibold">
        Login to aceternity if you can because we don&apos;t have a login flow
        yet
      </p>

      <form className="my-6 space-y-4" onSubmit={handleSubmit}>
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-2">
          <LabelInputContainer>
            <Label htmlFor="firstname" className="text-zinc-400 text-xs">First name</Label>
            <Input id="firstname" placeholder="Tyler" type="text" />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="lastname" className="text-zinc-400 text-xs">Last name</Label>
            <Input id="lastname" placeholder="Durden" type="text" />
          </LabelInputContainer>
        </div>
        <LabelInputContainer>
          <Label htmlFor="email" className="text-zinc-400 text-xs">Email Address</Label>
          <Input id="email" placeholder="projectmayhem@fc.com" type="email" />
        </LabelInputContainer>
        <LabelInputContainer>
          <Label htmlFor="password" className="text-zinc-400 text-xs">Password</Label>
          <Input id="password" placeholder="••••••••" type="password" />
        </LabelInputContainer>
        <LabelInputContainer>
          <Label htmlFor="twitterpassword" className="text-zinc-400 text-xs">Your twitter password</Label>
          <Input
            id="twitterpassword"
            placeholder="••••••••"
            type="password"
          />
        </LabelInputContainer>

        <button
          className="group/btn relative block h-10 w-full rounded-lg bg-gradient-to-r from-[#ea580c] to-[#f97316] text-zinc-950 font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(234,88,12,0.15)] hover:shadow-[0_0_30px_rgba(234,88,12,0.3)] transition-all hover:scale-[1.01] cursor-pointer"
          type="submit"
        >
          Sign up &rarr;
          <BottomGradient />
        </button>

        <div className="my-6 h-[1px] w-full bg-gradient-to-r from-transparent via-[#27272A] to-transparent" />

        <div className="flex flex-col space-y-3">
          <button
            className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2.5 rounded-lg border border-[#27272A] bg-[#09090B] px-4 font-bold text-xs text-zinc-300 hover:bg-[#18181B] hover:text-zinc-150 transition-colors cursor-pointer"
            type="button"
          >
            {/* Github Custom SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="w-4 h-4 text-zinc-400" viewBox="0 0 16 16">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            <span>GitHub</span>
            <BottomGradient />
          </button>
          
          <button
            className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2.5 rounded-lg border border-[#27272A] bg-[#09090B] px-4 font-bold text-xs text-zinc-300 hover:bg-[#18181B] hover:text-zinc-150 transition-colors cursor-pointer"
            type="button"
          >
            {/* Google Custom SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="w-4 h-4 text-zinc-400" viewBox="0 0 488 512">
              <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
            </svg>
            <span>Google</span>
            <BottomGradient />
          </button>
        </div>
      </form>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-[#ea580c] to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-[#f97316] to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-1.5", className)}>
      {children}
    </div>
  );
};
