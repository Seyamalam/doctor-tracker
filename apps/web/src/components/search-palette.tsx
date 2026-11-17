"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandItemIcon,
  CommandList,
  CommandSeparator,
} from "@ui-sdk/react/command";
import {
  Dialog,
  DialogBackdrop,
  DialogContent,
  DialogShortcut,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog";
import {
  ArrowRight,
  LayoutDashboard,
  Moon,
  PanelLeft,
  Search,
  Stethoscope,
  Users,
} from "lucide-react";
import type { Route } from "next";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { backdropCls } from "@/components/dialogs";
import { cx, searchFieldCls } from "@/components/ui";
import { api } from "@/lib/api";

const SEARCH_DEBOUNCE_MS = 180;
const RESULT_LIMIT = 5;

const pages = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
  { icon: Stethoscope, label: "Doctors", to: "/doctors" },
  { icon: Users, label: "Patients", to: "/patients" },
] as const;

const useDebounced = (value: string) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value]);
  return debounced;
};

const useGlobalSearch = (query: string, enabled: boolean) =>
  useQuery({
    enabled: enabled && query.length > 0,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const [doctors, patients] = await Promise.all([
        api.doctors.list({ limit: RESULT_LIMIT, search: query }),
        api.patients.list({ limit: RESULT_LIMIT, search: query }),
      ]);
      return { doctors: doctors.data, patients: patients.data };
    },
    queryKey: ["globalSearch", query],
    staleTime: 15_000,
  });

const groupLabelCls =
  "text-muted-foreground px-2.5 py-1.5 text-[11px] font-medium tracking-[0.08em] uppercase";

const paletteContentCls =
  "fixed left-1/2 top-[10%] z-50 m-0 flex max-h-[70dvh] w-[min(92vw,34rem)] -translate-x-1/2 flex-col overflow-hidden rounded-xl border border-border bg-card p-0 text-foreground shadow-2xl transition-[opacity,scale] duration-150 ease-out data-ending-style:scale-[0.98] data-starting-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-opacity";

const SearchPalette = ({
  onOpenChange,
  onToggleSidebar,
  open,
}: {
  onOpenChange: (open: boolean) => void;
  onToggleSidebar: () => void;
  open: boolean;
}) => {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [query, setQuery] = useState("");
  const debounced = useDebounced(query.trim());
  const { data, isFetching } = useGlobalSearch(debounced, open);
  const searching = isFetching && debounced.length > 0;

  const doctors = data?.doctors ?? [];
  const patients = data?.patients ?? [];

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setQuery("");
    }
    onOpenChange(next);
  };

  const close = () => handleOpenChange(false);

  const onAction = (value: string) => {
    close();
    if (value === "toggle-theme") {
      setTheme(resolvedTheme === "dark" ? "light" : "dark");
      return;
    }
    if (value === "toggle-sidebar") {
      onToggleSidebar();
      return;
    }
    if (value === "all-doctors") {
      router.push(`/doctors?search=${encodeURIComponent(debounced)}` as Route);
      return;
    }
    if (value === "all-patients") {
      router.push(`/patients?search=${encodeURIComponent(debounced)}` as Route);
      return;
    }
    if (value.startsWith("patient-")) {
      const patient = patients.find((p) => `patient-${p.id}` === value);
      router.push(
        (patient?.doctorId
          ? `/doctors/${patient.doctorId}`
          : "/patients") as Route
      );
      return;
    }
    if (value.startsWith("doctor-")) {
      router.push(`/doctors/${value.slice(7)}` as Route);
      return;
    }
    router.push(value as Route);
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger
        aria-label="Search doctors, patients and pages"
        className={cx(searchFieldCls, "w-full sm:mx-auto sm:max-w-md")}
        shortcut="mod+k"
      >
        <Search aria-hidden="true" className="h-4 w-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate">Search…</span>
        <DialogShortcut className="text-muted-foreground hidden font-mono text-[10px] sm:inline" />
      </DialogTrigger>
      <DialogBackdrop className={backdropCls} />
      <DialogContent className={paletteContentCls}>
        <DialogTitle className="sr-only">Search</DialogTitle>
        <Command
          className="w-full border-0 bg-transparent"
          onAction={onAction}
          onQueryChange={setQuery}
          query={query}
        >
          <div className="border-border flex items-center gap-2.5 border-b px-4">
            <Search
              aria-hidden="true"
              className="text-muted-foreground h-4 w-4 shrink-0"
            />
            <CommandInput
              aria-label="Search doctors, patients and pages"
              className="text-foreground placeholder:text-muted-foreground h-12 min-w-0 flex-1 bg-transparent text-sm outline-none"
              placeholder="Search doctors, patients, pages…"
              spellCheck={false}
            />
          </div>
          {searching ? (
            <p className="text-muted-foreground px-4 pt-2 text-xs">
              Searching…
            </p>
          ) : null}
          {!searching && (
            <CommandEmpty className="text-muted-foreground px-4 py-10 text-center text-sm">
              No results for “{debounced}”.
            </CommandEmpty>
          )}
          <CommandList className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
            {debounced.length === 0 && (
              <CommandGroup>
                <CommandGroupLabel className={groupLabelCls}>
                  Pages
                </CommandGroupLabel>
                {pages.map(({ icon: Icon, label, to }) => (
                  <CommandItem
                    className="flex items-center gap-2.5"
                    key={to}
                    label={label}
                    value={to}
                  >
                    <CommandItemIcon>
                      <Icon aria-hidden="true" className="h-4 w-4" />
                    </CommandItemIcon>
                    {label}
                  </CommandItem>
                ))}
                <CommandItem
                  className="flex items-center gap-2.5"
                  keywords={["dark", "light", "mode"]}
                  label="Toggle theme"
                  value="toggle-theme"
                >
                  <CommandItemIcon>
                    <Moon aria-hidden="true" className="h-4 w-4" />
                  </CommandItemIcon>
                  Toggle theme
                  <kbd className="border-border bg-muted text-muted-foreground ml-auto inline-flex h-5 items-center rounded border px-1.5 font-mono text-[10px]">
                    D
                  </kbd>
                </CommandItem>
                <CommandItem
                  className="flex items-center gap-2.5"
                  keywords={["collapse", "expand", "rail"]}
                  label="Toggle sidebar"
                  value="toggle-sidebar"
                >
                  <CommandItemIcon>
                    <PanelLeft aria-hidden="true" className="h-4 w-4" />
                  </CommandItemIcon>
                  Toggle sidebar
                  <kbd className="border-border bg-muted text-muted-foreground ml-auto inline-flex h-5 items-center rounded border px-1.5 font-mono text-[10px]">
                    B
                  </kbd>
                </CommandItem>
              </CommandGroup>
            )}
            {doctors.length > 0 && (
              <CommandGroup>
                <CommandGroupLabel className={groupLabelCls}>
                  Doctors
                </CommandGroupLabel>
                {doctors.map((doctor) => (
                  <CommandItem
                    className="flex items-center gap-2.5"
                    key={doctor.id}
                    keywords={[doctor.specialization, doctor.hospital]}
                    label={doctor.name}
                    value={`doctor-${doctor.id}`}
                  >
                    <CommandItemIcon>
                      <Stethoscope aria-hidden="true" className="h-4 w-4" />
                    </CommandItemIcon>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{doctor.name}</span>
                      <span className="text-muted-foreground block truncate text-xs">
                        {doctor.specialization} · {doctor.hospital}
                      </span>
                    </span>
                  </CommandItem>
                ))}
                <CommandItem
                  className="text-muted-foreground flex items-center gap-2.5"
                  label="See all matching doctors"
                  value="all-doctors"
                >
                  <CommandItemIcon>
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </CommandItemIcon>
                  See all matching doctors
                </CommandItem>
              </CommandGroup>
            )}
            {doctors.length > 0 && patients.length > 0 && (
              <CommandSeparator className="bg-border my-1.5 h-px" />
            )}
            {patients.length > 0 && (
              <CommandGroup>
                <CommandGroupLabel className={groupLabelCls}>
                  Patients
                </CommandGroupLabel>
                {patients.map((patient) => (
                  <CommandItem
                    className="flex items-center gap-2.5"
                    key={patient.id}
                    keywords={[patient.condition, patient.doctor?.name ?? ""]}
                    label={patient.name}
                    value={`patient-${patient.id}`}
                  >
                    <CommandItemIcon>
                      <Users aria-hidden="true" className="h-4 w-4" />
                    </CommandItemIcon>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{patient.name}</span>
                      <span className="text-muted-foreground block truncate text-xs">
                        {patient.condition}
                        {patient.doctor ? ` · ${patient.doctor.name}` : ""}
                      </span>
                    </span>
                  </CommandItem>
                ))}
                <CommandItem
                  className="text-muted-foreground flex items-center gap-2.5"
                  label="See all matching patients"
                  value="all-patients"
                >
                  <CommandItemIcon>
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </CommandItemIcon>
                  See all matching patients
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export default SearchPalette;
