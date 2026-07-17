"use client";

import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/animate-ui/components/radix/hover-card";

interface RadixHoverCardDemoProps {
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
  align?: "start" | "center" | "end";
  alignOffset?: number;
  followCursor?: boolean | "x" | "y";
}

export const RadixHoverCardDemo = ({
  side,
  sideOffset,
  align,
  alignOffset,
  followCursor,
}: RadixHoverCardDemoProps) => {
  return (
    <HoverCard followCursor={followCursor}>
      <HoverCardTrigger asChild>
        <a
          className="w-12 h-12 flex items-center justify-center border border-[#27272A] rounded-full overflow-hidden"
          href="https://twitter.com/animate_ui"
          target="_blank"
          rel="noreferrer noopener"
        >
          <img
            src="https://pbs.twimg.com/profile_images/1950218390741618688/72447Y7e_400x400.jpg"
            alt="Animate UI"
            className="w-full h-full object-cover"
            suppressHydrationWarning
          />
        </a>
      </HoverCardTrigger>

      <HoverCardContent
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className="w-80"
      >
        <div className="flex flex-col gap-4">
          <img
            className="w-16 h-16 rounded-full overflow-hidden border border-[#27272A]"
            src="https://pbs.twimg.com/profile_images/1950218390741618688/72447Y7e_400x400.jpg"
            alt="Animate UI"
            suppressHydrationWarning
          />
          <div className="flex flex-col gap-2">
            <div>
              <div className="font-bold text-zinc-150 text-sm">Animate UI</div>
              <div className="text-xs text-zinc-500 font-semibold">@animate_ui</div>
            </div>
            <div className="text-[11px] text-zinc-400 font-semibold leading-relaxed">
              A fully animated, open-source component distribution built with
              React, TypeScript, Tailwind CSS, and Motion.
            </div>
            <div className="flex gap-4 mt-2">
              <div className="flex gap-1 text-xs items-center font-bold">
                <div className="text-zinc-200">0</div>{" "}
                <div className="text-zinc-500 font-semibold">Following</div>
              </div>
              <div className="flex gap-1 text-xs items-center font-bold">
                <div className="text-zinc-200">2,900</div>{" "}
                <div className="text-zinc-500 font-semibold">Followers</div>
              </div>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
