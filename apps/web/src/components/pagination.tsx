"use client";

import {
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationList,
  PaginationNext,
  PaginationPrevious,
} from "@ui-sdk/react/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cx } from "@/components/ui";

const pageBtn =
  "inline-flex h-8 min-w-8 select-none items-center justify-center rounded-md px-2 font-medium text-[13px] text-foreground transition-[background-color,color] duration-100 data-current:bg-primary data-current:text-primary-foreground data-disabled:opacity-40 hover:bg-muted data-current:hover:bg-primary/90 motion-reduce:transition-none coarse:h-10 coarse:min-w-10";

interface TablePaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

export const TablePagination = ({ page, pageCount, onPageChange }: TablePaginationProps) => {
  if (pageCount <= 1) {
    return null;
  }
  return (
    <Pagination
      aria-label="Table pagination"
      onPageChange={(next) => onPageChange(next)}
      page={page}
      pageCount={pageCount}
    >
      <PaginationList className="flex items-center gap-1">
        {({ items }) => (
          <>
            <PaginationItem>
              <PaginationPrevious
                aria-label="Previous page"
                className={cx(pageBtn)}
                data-variant="ghost"
              >
                <ChevronLeft className="h-4 w-4" />
              </PaginationPrevious>
            </PaginationItem>
            {items.map((item) => (
              <PaginationItem key={item}>
                {typeof item === "number" ? (
                  <PaginationLink className={pageBtn} data-variant="ghost" page={item} />
                ) : (
                  <PaginationEllipsis className="text-muted-foreground flex h-8 w-8 items-center justify-center" />
                )}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext aria-label="Next page" className={cx(pageBtn)} data-variant="ghost">
                <ChevronRight className="h-4 w-4" />
              </PaginationNext>
            </PaginationItem>
          </>
        )}
      </PaginationList>
    </Pagination>
  );
};
