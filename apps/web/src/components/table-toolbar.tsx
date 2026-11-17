"use client";

import { useDebouncedCallback } from "@tanstack/react-pacer";
import { Input } from "@ui-sdk/react/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select";
import { Search } from "lucide-react";
import { useState } from "react";

import { selectContentCls, selectTriggerCls } from "@/components/form-fields";
import { TablePagination } from "@/components/pagination";
import { btn, cx, inputCls, labelCls, selectItemCls } from "@/components/ui";
import { useSetTableParams, useTableParams } from "@/lib/search-params";

export const SearchInput = ({ placeholder }: { placeholder: string }) => {
  const { search } = useTableParams();
  const setParams = useSetTableParams();
  const [value, setValue] = useState(search);
  const [prevSearch, setPrevSearch] = useState(search);

  if (prevSearch !== search) {
    setPrevSearch(search);
    setValue(search);
  }

  const apply = useDebouncedCallback(
    (next: string) => setParams({ page: 1, search: next || null }),
    { wait: 300 },
  );

  return (
    <div className="flex min-w-44 flex-1 flex-col gap-1">
      <label className={labelCls} htmlFor="table-search">
        Search
      </label>
      <div className="relative">
        <Search
          aria-hidden="true"
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
        />
        <Input
          className={cx(inputCls, "pl-9")}
          id="table-search"
          name="search"
          onValueChange={(next) => {
            setValue(next);
            apply(next);
          }}
          placeholder={placeholder}
          type="search"
          value={value}
        />
      </div>
    </div>
  );
};

const ALL = "all";

export const FilterSelect = ({
  param,
  label,
  items,
}: {
  param: string;
  label: string;
  items: { value: string; label: string }[];
}) => {
  const { get } = useTableParams();
  const setParams = useSetTableParams();
  const allItems = [{ label: `All ${label.toLowerCase()}`, value: ALL }, ...items];
  return (
    <div className="flex flex-col gap-1">
      <span className={labelCls}>{label}</span>
      <Select
        items={allItems}
        onValueChange={(next) => setParams({ page: 1, [param]: next === ALL ? null : next })}
        value={get(param) || ALL}
      >
        <SelectTrigger
          aria-label={`Filter by ${label.toLowerCase()}`}
          className={cx(selectTriggerCls, "w-40")}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className={selectContentCls} side="bottom" sideOffset={4}>
          {allItems.map((item) => (
            <SelectItem className={selectItemCls} key={item.value} value={item.value}>
              {item.label}
              <SelectItemIndicator className="text-primary" />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export const SortSelect = ({ items }: { items: { value: string; label: string }[] }) => {
  const { sort } = useTableParams();
  const setParams = useSetTableParams();
  const allItems = [{ label: "Newest first", value: "default" }, ...items];
  return (
    <div className="flex flex-col gap-1">
      <span className={labelCls}>Sort</span>
      <Select
        items={allItems}
        onValueChange={(next) => setParams({ page: 1, sort: next === "default" ? null : next })}
        value={sort || "default"}
      >
        <SelectTrigger aria-label="Sort results" className={cx(selectTriggerCls, "w-40")}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className={selectContentCls} side="bottom" sideOffset={4}>
          {allItems.map((item) => (
            <SelectItem className={selectItemCls} key={item.value} value={item.value}>
              {item.label}
              <SelectItemIndicator className="text-primary" />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export const DateRangeFilters = () => {
  const { from, to } = useTableParams();
  const setParams = useSetTableParams();
  return (
    <>
      <div className="flex flex-col gap-1">
        <label className={labelCls} htmlFor="filter-from">
          From
        </label>
        <input
          className={cx(inputCls, "w-36")}
          id="filter-from"
          max={to || undefined}
          name="from"
          onChange={(e) => setParams({ from: e.target.value || null, page: 1 })}
          type="date"
          value={from}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelCls} htmlFor="filter-to">
          To
        </label>
        <input
          className={cx(inputCls, "w-36")}
          id="filter-to"
          min={from || undefined}
          name="to"
          onChange={(e) => setParams({ page: 1, to: e.target.value || null })}
          type="date"
          value={to}
        />
      </div>
    </>
  );
};

export const ClearFiltersButton = ({ onClear }: { onClear: () => void }) => (
  <button className={cx(btn.ghost, "mb-px")} onClick={onClear} type="button">
    Clear filters
  </button>
);

export const TableFooter = ({
  page,
  limit,
  total,
  totalPages,
}: {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}) => {
  const setParams = useSetTableParams();
  if (total === 0) {
    return null;
  }
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-muted-foreground text-[13px]">
        Showing <span className="text-foreground font-medium">{start}</span>–
        <span className="text-foreground font-medium">{end}</span> of{" "}
        <span className="text-foreground font-medium">{total}</span>
      </p>
      <TablePagination
        onPageChange={(next) => setParams({ page: next })}
        page={page}
        pageCount={totalPages}
      />
    </div>
  );
};
