"use client";

import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApplicationStore } from "@/store";
import { useTranslations } from "next-intl";
import { SortField } from "@/types";
import { cn } from "@/lib/utils";

const sortFields: SortField[] = [
  "applicationDate",
  "companyName",
  "status",
  "createdAt",
  "updatedAt",
];

export function SortDropdown() {
  const { sort, setSort } = useApplicationStore();
  const t = useTranslations();

  const handleSortChange = (field: SortField) => {
    if (sort.field === field) {
      // Toggle order if same field
      setSort({ field, order: sort.order === "asc" ? "desc" : "asc" });
    } else {
      // Default to desc for new field
      setSort({ field, order: "desc" });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="group gap-1.5" aria-label={t("common.sort")}>

          <ArrowUpDown className="h-4 w-4" />
          <span className="max-w-0 opacity-0 overflow-hidden whitespace-nowrap transition-all duration-200 sm:group-hover:max-w-[140px] sm:group-hover:opacity-100 sm:group-hover:ml-2">
            {t("common.sort")}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>{t("common.sort")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {sortFields.map((field) => (
          <DropdownMenuItem
            key={field}
            onClick={() => handleSortChange(field)}
            className={cn(
              "flex items-center justify-between",
              sort.field === field && "bg-accent"
            )}
          >
            <span>{t(`sort.${field}`)}</span>
            {sort.field === field &&
              (sort.order === "asc" ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              ))}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
