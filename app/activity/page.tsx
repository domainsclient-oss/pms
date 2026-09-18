import { redirect } from "next/navigation";
import { ActivityLogPage } from "@/components/activity-log-page";
import { listActivities } from "@/lib/services/activity-service";
import { getUser } from "@/lib/services/user-service";
import { getSession } from "@/lib/session";

export default async function ActivityPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const currentUser = await getUser(session.uid);
  if (currentUser?.role !== "Admin") redirect("/");

  const activities = await listActivities();

  return <ActivityLogPage activities={activities} />;
}
