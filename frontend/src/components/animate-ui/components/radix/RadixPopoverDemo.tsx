"use client";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/animate-ui/components/radix/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RadixPopoverDemoProps {
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
  align?: "start" | "center" | "end";
  alignOffset?: number;
}

export const RadixPopoverDemo = ({
  side,
  sideOffset,
  align,
  alignOffset,
}: RadixPopoverDemoProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className="w-80"
      >
        <div className="grid gap-4">
          <div className="space-y-1">
            <h4 className="leading-none text-xs font-bold text-zinc-200">Dimensions</h4>
            <p className="text-zinc-500 text-[10px] font-semibold">
              Set the dimensions for the layer.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="width" className="text-zinc-400 text-xs">Width</Label>
              <Input
                id="width"
                defaultValue="100%"
                className="col-span-2 h-8 bg-[#09090B] border-[#27272A] text-xs rounded-lg"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="maxWidth" className="text-zinc-400 text-xs">Max. width</Label>
              <Input
                id="maxWidth"
                defaultValue="300px"
                className="col-span-2 h-8 bg-[#09090B] border-[#27272A] text-xs rounded-lg"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="height" className="text-zinc-400 text-xs">Height</Label>
              <Input
                id="height"
                defaultValue="25px"
                className="col-span-2 h-8 bg-[#09090B] border-[#27272A] text-xs rounded-lg"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="maxHeight" className="text-zinc-400 text-xs">Max. height</Label>
              <Input
                id="maxHeight"
                defaultValue="none"
                className="col-span-2 h-8 bg-[#09090B] border-[#27272A] text-xs rounded-lg"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
