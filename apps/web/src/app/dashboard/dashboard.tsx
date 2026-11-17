"use client";

import { Activity, CalendarPlus, Stethoscope, Users } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { btn, Card, EmptyState, PageHeader, Skeleton } from "@/components/ui";
import { formatDate, formatDayLabel } from "@/lib/format";
import { useStats } from "@/lib/hooks/use-stats";

const TEAL = "#14b8a6";
const SLATE = "#64748b";
const PIE_COLORS = ["#0d9488", "#0891b2", "#10b981", "#0ea5e9", "#64748b", "#94a3b8"];

const StatCard = ({
  label,
  value,
  icon: Icon,
  sub,
}: {
  label: string;
  value: string;
  icon: typeof Stethoscope;
  sub?: string;
}) => (
  <Card className="flex items-start justify-between gap-3 p-4">
    <div className="min-w-0">
      <p className="text-muted-foreground text-[13px] font-medium">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
      {sub ? <p className="text-muted-foreground mt-0.5 truncate text-xs">{sub}</p> : null}
    </div>
    <div className="bg-primary/10 text-primary rounded-lg p-2">
      <Icon className="h-4.5 w-4.5" />
    </div>
  </Card>
);

const ChartTooltip = ({
  active,
  label,
  payload,
}: {
  active?: boolean;
  label?: string;
  payload?: { name?: string; value?: number }[];
}) => {
  if (!(active && payload?.length)) {
    return null;
  }
  return (
    <div className="border-border bg-card rounded-lg border px-3 py-2 text-xs shadow-md">
      {label ? <p className="text-muted-foreground mb-1">{label}</p> : null}
      {payload.map((item) => (
        <p className="text-foreground font-medium" key={item.name}>
          {item.name}: <span className="text-primary">{item.value}</span>
        </p>
      ))}
    </div>
  );
};

export const DashboardSkeleton = () => (
  <main className="anim-fade mx-auto w-full max-w-6xl px-4 py-6" aria-busy="true">
    <Skeleton className="mb-6 h-7 w-40" />
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton className="h-24 w-full rounded-xl" key={i} />
      ))}
    </div>
    <div className="mt-4 grid gap-4 lg:grid-cols-3">
      <Skeleton className="h-72 w-full rounded-xl lg:col-span-2" />
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  </main>
);

const Dashboard = ({ name }: { name: string }) => {
  const stats = useStats();

  if (stats.isPending) {
    return <DashboardSkeleton />;
  }

  if (stats.isError || !stats.data) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        <PageHeader description="Your practice at a glance" title="Dashboard" />
        <Card className="mt-6">
          <EmptyState
            action={
              <button className={btn.outline} onClick={() => stats.refetch()} type="button">
                Retry
              </button>
            }
            description="The stats endpoint could not be reached."
            title="Could not load dashboard"
          />
        </Card>
      </main>
    );
  }

  const {
    totals,
    patientsPerDoctor,
    patientsByCondition,
    patientsPerDay,
    doctorsPerDay,
    recentPatients,
  } = stats.data;

  const MAX_PIE_SLICES = 5;
  const topConditions = patientsByCondition.slice(0, MAX_PIE_SLICES);
  const otherCount = patientsByCondition
    .slice(MAX_PIE_SLICES)
    .reduce((sum, entry) => sum + entry.count, 0);
  const pieData =
    otherCount > 0 ? [...topConditions, { condition: "Other", count: otherCount }] : topConditions;

  const avgPerDoctor = totals.doctors > 0 ? (totals.patients / totals.doctors).toFixed(1) : "0";
  const newLastWeek = patientsPerDay.slice(-7).reduce((sum, day) => sum + day.count, 0);
  const topDoctors = patientsPerDoctor.slice(0, 8);
  const doctorCountByDay = new Map(doctorsPerDay.map((day) => [day.date, day.count]));
  const activity = patientsPerDay.slice(-30).map((day) => ({
    date: day.date,
    doctors: doctorCountByDay.get(day.date) ?? 0,
    patients: day.count,
  }));

  return (
    <main className="anim-enter mx-auto w-full max-w-6xl px-4 py-6">
      <PageHeader
        description={`Welcome back, ${name}. Here's your practice at a glance.`}
        title="Dashboard"
      />

      <div className="stagger mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Stethoscope}
          label="Doctors"
          sub="on the directory"
          value={String(totals.doctors)}
        />
        <StatCard icon={Users} label="Patients" sub="under care" value={String(totals.patients)} />
        <StatCard
          icon={Activity}
          label="Patients per doctor"
          sub="average caseload"
          value={avgPerDoctor}
        />
        <StatCard
          icon={CalendarPlus}
          label="New patients"
          sub="last 7 days"
          value={String(newLastWeek)}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="text-muted-foreground text-[13px] font-medium">
            New activity — last 30 days
          </h2>
          <div className="mt-3 h-64">
            <ResponsiveContainer height="100%" width="100%">
              <AreaChart data={activity} margin={{ left: -22, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="patientsGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={TEAL} stopOpacity={0.32} />
                    <stop offset="100%" stopColor={TEAL} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="doctorsGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={SLATE} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={SLATE} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickFormatter={formatDayLabel} tickLine={false} />
                <YAxis allowDecimals={false} tickLine={false} width={40} />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconSize={10} />
                <Area
                  dataKey="patients"
                  fill="url(#patientsGradient)"
                  name="Patients"
                  stroke={TEAL}
                  strokeWidth={2}
                  type="monotone"
                />
                <Area
                  dataKey="doctors"
                  fill="url(#doctorsGradient)"
                  name="Doctors"
                  stroke={SLATE}
                  strokeWidth={2}
                  type="monotone"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="text-muted-foreground text-[13px] font-medium">Patients by condition</h2>
          <div className="mt-3 h-48">
            <ResponsiveContainer height="100%" width="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="count"
                  innerRadius={42}
                  nameKey="condition"
                  outerRadius={66}
                  paddingAngle={2}
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell fill={PIE_COLORS[index % PIE_COLORS.length]} key={entry.condition} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
            {pieData.map((entry, index) => (
              <li className="flex items-center gap-2 text-xs" key={entry.condition}>
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                />
                <span className="text-muted-foreground min-w-0 truncate" title={entry.condition}>
                  {entry.condition}
                </span>
                <span className="text-foreground ml-auto font-medium tabular-nums">
                  {entry.count}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card>
          <h2 className="text-muted-foreground text-[13px] font-medium">Patients per doctor</h2>
          <div className="mt-3 h-64">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={topDoctors} layout="vertical" margin={{ left: 8, right: 16, top: 4 }}>
                <XAxis allowDecimals={false} tickLine={false} type="number" />
                <YAxis dataKey="name" tickLine={false} type="category" width={96} />
                <Tooltip content={<ChartTooltip />} cursor={false} />
                <Legend iconSize={10} />
                <Bar dataKey="count" fill={TEAL} name="Patients" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-muted-foreground text-[13px] font-medium">Recent patients</h2>
            <Link className="text-primary text-[13px] font-medium hover:underline" href="/patients">
              View all
            </Link>
          </div>
          {recentPatients.length === 0 ? (
            <EmptyState
              description="New patients will appear here once added."
              title="No patients yet"
            />
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[30rem] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-border border-b">
                    <th className="text-muted-foreground h-9 px-2 text-xs font-medium" scope="col">
                      Name
                    </th>
                    <th className="text-muted-foreground h-9 px-2 text-xs font-medium" scope="col">
                      Condition
                    </th>
                    <th className="text-muted-foreground h-9 px-2 text-xs font-medium" scope="col">
                      Doctor
                    </th>
                    <th className="text-muted-foreground h-9 px-2 text-xs font-medium" scope="col">
                      Added
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentPatients.map((patient) => (
                    <tr className="border-border border-b last:border-0" key={patient.id}>
                      <td className="px-2 py-2.5 font-medium">{patient.name}</td>
                      <td className="text-muted-foreground px-2 py-2.5">{patient.condition}</td>
                      <td className="px-2 py-2.5">
                        {patient.doctor ? (
                          <Link
                            className="text-primary hover:underline"
                            href={`/doctors/${patient.doctor.id}` as Route}
                          >
                            {patient.doctor.name}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="text-muted-foreground px-2 py-2.5">
                        {formatDate(patient.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
};

export default Dashboard;
