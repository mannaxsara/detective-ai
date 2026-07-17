"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
  type DialogContentProps,
} from "@/components/animate-ui/components/radix/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface RadixDialogDemoProps {
  from: DialogContentProps["from"];
  showCloseButton: boolean;
}

export const RadixDialogDemo = ({
  from,
  showCloseButton,
}: RadixDialogDemoProps) => {
  return (
    <Dialog>
      <form onSubmit={(e) => e.preventDefault()}>
        <DialogTrigger asChild>
          <Button variant="outline">Open Dialog</Button>
        </DialogTrigger>
        <DialogContent
          from={from}
          showCloseButton={showCloseButton}
          className="sm:max-w-[425px]"
        >
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 mt-2">
            <div className="grid gap-1.5">
              <Label htmlFor="name-1" className="text-zinc-400 text-xs">Name</Label>
              <Input id="name-1" name="name" defaultValue="Pedro Duarte" className="bg-[#09090B] border-[#27272A] text-xs h-9 rounded-lg" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="username-1" className="text-zinc-400 text-xs">Username</Label>
              <Input id="username-1" name="username" defaultValue="@peduarte" className="bg-[#09090B] border-[#27272A] text-xs h-9 rounded-lg" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="h-9 text-xs rounded-lg">Cancel</Button>
            </DialogClose>
            <Button type="submit" className="h-9 text-xs rounded-lg">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
};
