"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Checkbox,
  type CheckboxProps,
} from "@/components/animate-ui/components/radix/checkbox";

interface RadixCheckboxDemoProps {
  checked: boolean | "indeterminate";
  variant?: CheckboxProps["variant"];
  size?: CheckboxProps["size"];
}

export const RadixCheckboxDemo = ({
  checked,
  variant,
  size,
}: RadixCheckboxDemoProps) => {
  const [isChecked, setIsChecked] = useState(checked ?? false);

  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  return (
    <Label className="flex items-center gap-x-3 text-xs text-zinc-300 font-semibold cursor-pointer">
      <Checkbox
        checked={isChecked}
        onCheckedChange={(val) => setIsChecked(val)}
        variant={variant}
        size={size}
      />
      Accept terms and conditions
    </Label>
  );
};
