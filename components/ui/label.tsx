import * as React from "react"
import { cn } from "@/lib/utils"

// Needs @radix-ui/react-label. I will install it or use a simple replacement.
// Plan said "Foundation" - better to just stick to a Styled Label for MVP to avoid dependency hell if I missed installing it.
// I'll implement a simple Label.

const Label = React.forwardRef<
    HTMLLabelElement,
    React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
    <label
        ref={ref}
        className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            className
        )}
        {...props}
    />
))
Label.displayName = "Label"

export { Label }
