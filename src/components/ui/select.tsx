"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const EMPTY_VALUE = "__rc_select_empty__";

type OptionData = {
  value: string;
  label: string;
  disabled?: boolean;
};

function getOptionLabel(children: React.ReactNode): string {
  if (children == null || typeof children === "boolean") return "";
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  const parts: string[] = [];
  React.Children.forEach(children, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      parts.push(String(child));
    }
  });
  return parts.join("");
}

function parseOptionChildren(children: React.ReactNode): OptionData[] {
  const options: OptionData[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child) || child.type !== "option") return;
    const props = child.props as React.OptionHTMLAttributes<HTMLOptionElement>;
    options.push({
      value: props.value == null ? "" : String(props.value),
      label: getOptionLabel(props.children),
      disabled: props.disabled,
    });
  });
  return options;
}

function toInternalValue(value: string) {
  return value === "" ? EMPTY_VALUE : value;
}

function toExternalValue(value: string) {
  return value === EMPTY_VALUE ? "" : value;
}

function fireChange(
  onChange: SelectProps["onChange"],
  value: string,
  isControlled: boolean,
  setUncontrolled: (value: string) => void,
) {
  if (!isControlled) setUncontrolled(value);
  onChange?.({
    target: { value },
    currentTarget: { value },
  } as React.ChangeEvent<HTMLSelectElement>);
}

export interface SelectProps
  extends Omit<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    "onChange" | "value" | "defaultValue"
  > {
  value?: string;
  defaultValue?: string;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
}

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      className,
      children,
      value,
      defaultValue,
      onChange,
      disabled,
      required,
      id,
      name,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
    },
    ref,
  ) => {
    const options = React.useMemo(() => parseOptionChildren(children), [children]);
    const isControlled = value !== undefined;
    const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? "");
    const currentValue = isControlled ? (value ?? "") : uncontrolled;

    const placeholderOption = options.find((option) => option.value === "");
    const placeholder = placeholderOption?.label ?? "Select...";

    if (options.length === 0) return null;

    return (
      <>
        {name ? (
          <input type="hidden" name={name} value={currentValue} readOnly />
        ) : null}
        <SelectPrimitive.Root
          value={toInternalValue(currentValue)}
          onValueChange={(next) =>
            fireChange(
              onChange,
              toExternalValue(next),
              isControlled,
              setUncontrolled,
            )
          }
          disabled={disabled}
          required={required}
        >
          <SelectPrimitive.Trigger
            ref={ref}
            id={id}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            className={cn(
              "flex h-10 w-full items-center justify-between gap-2 rounded-md border border-sage/40 bg-white px-3 py-2 text-sm text-graphite ring-offset-white transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-evergreen focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "data-[placeholder]:text-graphite/50",
              className,
            )}
          >
            <SelectPrimitive.Value
              placeholder={placeholder}
              className="min-w-0 flex-1 truncate text-left"
            />
            <SelectPrimitive.Icon asChild>
              <ChevronDown
                className="h-4 w-4 shrink-0 text-graphite/45 transition-transform duration-200 data-[state=open]:rotate-180"
                aria-hidden
              />
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>

          <SelectPrimitive.Portal>
            <SelectPrimitive.Content
              position="popper"
              side="bottom"
              sideOffset={4}
              align="start"
              avoidCollisions
              collisionPadding={10}
              className={cn(
                "z-[250] overflow-hidden rounded-md border border-sage/30 bg-white text-graphite shadow-card",
                "data-[state=open]:animate-in data-[state=closed]:animate-out",
                "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
              )}
              style={{
                minWidth: "var(--radix-select-trigger-width)",
                maxWidth: "min(24rem, calc(100vw - 1rem))",
                width: "max-content",
                maxHeight:
                  "min(14rem, var(--radix-select-content-available-height))",
              }}
            >
              <SelectPrimitive.Viewport className="rc-scroll-dropdown min-h-0 flex-1 p-1 pr-0.5">
                {options.map((option) => (
                  <SelectPrimitive.Item
                    key={option.value || EMPTY_VALUE}
                    value={toInternalValue(option.value)}
                    disabled={option.disabled}
                    className={cn(
                      "relative flex w-full cursor-default select-none items-start rounded-sm py-2 pl-8 pr-3 text-sm outline-none",
                      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                      "data-[highlighted]:bg-bone data-[highlighted]:text-graphite",
                      "data-[state=checked]:font-semibold data-[state=checked]:text-evergreen",
                    )}
                  >
                    <span className="absolute left-2 top-2 flex h-4 w-4 items-center justify-center">
                      <SelectPrimitive.ItemIndicator>
                        <Check
                          className="h-3.5 w-3.5 text-evergreen"
                          strokeWidth={2.5}
                        />
                      </SelectPrimitive.ItemIndicator>
                    </span>
                    <SelectPrimitive.ItemText className="whitespace-normal break-words leading-snug">
                      {option.label}
                    </SelectPrimitive.ItemText>
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
      </>
    );
  },
);
Select.displayName = "Select";

export { Select };
