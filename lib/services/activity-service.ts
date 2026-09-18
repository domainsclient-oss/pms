import { FieldValue, type DocumentSnapshot } from "firebase-admin/firestore";
import { firestore } from "@/lib/firebase-admin";

export type ActivityType = "project" | "user" | "session";

export interface Activity {
  id: string;
  type: ActivityType;
  action: "created" | "updated" | "deleted" | "signed_in";
  subject: string;
  actor: string;
  actorRole: string;
  createdAt: string;
}

type ActivityData = Omit<Activity, "id" | "createdAt"> & { createdAt?: { toDate?: () => Date } };
const activitiesCollection = firestore.collection("activities");

function activityFromSnapshot(snapshot: DocumentSnapshot): Activity {
  const data = snapshot.data() as ActivityData;
  return {
    id: snapshot.id,
    type: data.type,
    action: data.action,
    subject: data.subject,
    actor: data.actor,
    actorRole: data.actorRole,
    createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date(0).toISOString(),
  };
}

export async function listActivities() {
  const snapshot = await activitiesCollection.orderBy("createdAt", "desc").limit(30).get();
  return snapshot.docs.map(activityFromSnapshot);
}

export async function logActivity(activity: Omit<Activity, "id" | "createdAt">) {
  await activitiesCollection.add({ ...activity, createdAt: FieldValue.serverTimestamp() });
}
