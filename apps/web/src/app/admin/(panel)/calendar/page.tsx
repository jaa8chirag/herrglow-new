import { PageHeader } from "@/components/admin/layout";
import { CalendarView } from "@/components/admin/CalendarView";
import { getBeauticianSchedule } from "@herrglow/core";
import { requireAdmin } from "@/lib/admin";

export default async function AdminCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  await requireAdmin("leads");
  const { date } = await searchParams;
  const schedule = await getBeauticianSchedule(date);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Beautician Daily Roster & Schedule"
        subtitle="Live matrix view of all verified staff, morning/afternoon/evening doorstep slots, and assigned bookings across Delhi NCR."
      />
      <CalendarView schedule={schedule} />
    </div>
  );
}
