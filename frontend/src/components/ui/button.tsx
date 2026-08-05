import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent text-xs font-semibold tracking-wide whitespace-nowrap transition-all duration-150 outline-none select-none focus-visible:border-ring focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border-border shadow-xs hover:bg-primary/90 active:scale-[0.98]",
        outline:
          "border-border bg-card text-foreground hover:bg-muted hover:text-foreground active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground border-border hover:bg-secondary/80 active:scale-[0.98]",
        ghost:
          "hover:bg-muted hover:text-foreground border-transparent",
        destructive:
          "bg-destructive text-destructive-foreground border-destructive hover:bg-destructive/90",
        link: "text-foreground underline-offset-4 hover:underline border-transparent",
      },
      size: {
        default: "h-9 px-4 py-2 gap-2",
        xs: "h-6 px-2 text-[11px] rounded-sm gap-1",
        sm: "h-7.5 px-3 text-xs rounded-md gap-1.5",
        lg: "h-11 px-6 text-sm rounded-md gap-2.5",
        icon: "size-9 rounded-md",
        "icon-xs": "size-6 rounded-sm",
        "icon-sm": "size-7.5 rounded-md",
        "icon-lg": "size-11 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
