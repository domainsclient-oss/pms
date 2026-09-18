import { History } from "lucide-react";
import type { Activity } from "@/lib/services/activity-service";

const actionLabel = (action: Activity["action"]) => action === "signed_in" ? "Signed in" : action[0].toUpperCase() + action.slice(1);
const typeLabel = (type: Activity["type"]) => type === "session" ? "Account" : type[0].toUpperCase() + type.slice(1);

export function ActivityLogPage({ activities }: { activities: Activity[] }) {
  return (
    <div className="page-content">
      <div className="page-heading"><div><p className="eyebrow">Administrator access</p><h1>Activity log</h1><p className="subheading">The 30 most recent sign-ins and workspace changes.</p></div></div>
      <section className="panel projects-page">
        <div className="panel-header"><div><p className="eyebrow">Audit trail</p><h2>Recent activity</h2></div><History size={18} color="var(--green)" /></div>
        {activities.length === 0 ? <div className="empty-state"><History size={26} /><strong>No activity recorded yet</strong><span>New sign-ins and project or user changes will appear here.</span></div> : <div className="table-wrap"><table><thead><tr><th>Person</th><th>Role</th><th>Action</th><th>Record</th><th>Date & time</th></tr></thead><tbody>{activities.map((activity) => <tr key={activity.id}><td><div className="person-cell"><div className="avatar small">{activity.actor.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div><strong>{activity.actor}</strong></div></td><td><span className={`role role-${activity.actorRole.toLowerCase()}`}>{activity.actorRole}</span></td><td>{actionLabel(activity.action)} {typeLabel(activity.type).toLowerCase()}</td><td>{activity.subject}</td><td>{new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(activity.createdAt))}</td></tr>)}</tbody></table></div>}
      </section>
    </div>
  );
}
