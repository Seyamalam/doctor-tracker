"use client";

import { Field, FieldLabel } from "@ui-sdk/react/field";
import { Input } from "@ui-sdk/react/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select";
import { ChevronDown } from "lucide-react";

import {
  cx,
  FieldErrors,
  inputCls,
  labelCls,
  popupAnimCls,
  popupCls,
  selectItemCls,
} from "@/components/ui";

export interface FieldLike {
  name: string;
  state: { value: string; meta: { errors: unknown[] } };
  handleBlur: () => void;
  handleChange: (value: string) => void;
}

export const selectTriggerCls =
  "flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-card px-3 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring disabled:opacity-50";

export const selectContentCls = cx(
  popupCls,
  popupAnimCls,
  "max-h-72 min-w-(--anchor-width) overflow-y-auto p-1",
);

export const TextField = ({
  field,
  label,
  type = "text",
  placeholder,
  autoComplete,
}: {
  field: FieldLike;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) => (
  <Field name={field.name}>
    <FieldLabel className={labelCls}>{label}</FieldLabel>
    <Input
      autoComplete={autoComplete}
      className={inputCls}
      name={field.name}
      onBlur={field.handleBlur}
      onValueChange={(value) => field.handleChange(value)}
      placeholder={placeholder}
      type={type}
      value={field.state.value}
    />
    <FieldErrors errors={field.state.meta.errors} />
  </Field>
);

export const SelectField = ({
  field,
  label,
  items,
  placeholder,
}: {
  field: FieldLike;
  label: string;
  items: { value: string; label: string }[];
  placeholder: string;
}) => (
  <Field name={field.name}>
    <FieldLabel className={labelCls}>{label}</FieldLabel>
    <Select
      items={items}
      onValueChange={(value) => field.handleChange(value ?? "")}
      placeholder={placeholder}
      value={field.state.value || null}
    >
      <SelectTrigger className={selectTriggerCls}>
        <SelectValue />
        <ChevronDown aria-hidden="true" className="text-muted-foreground h-4 w-4 shrink-0" />
      </SelectTrigger>
      <SelectContent className={selectContentCls} side="bottom" sideOffset={4}>
        {items.map((item) => (
          <SelectItem className={selectItemCls} key={item.value} value={item.value}>
            {item.label}
            <SelectItemIndicator className="text-primary" />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    <FieldErrors errors={field.state.meta.errors} />
  </Field>
);
