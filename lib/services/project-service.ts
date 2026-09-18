import { FieldValue, type DocumentSnapshot } from "firebase-admin/firestore";
import { firestore } from "@/lib/firebase-admin";
import { Project } from "@/lib/types";

const projectsCollection = firestore.collection("projects");

function projectFromSnapshot(snapshot: DocumentSnapshot): Project {
  const { createdAt, updatedAt, ...project } = snapshot.data() as Omit<Project, "id"> & { createdAt?: unknown; updatedAt?: unknown };
  void createdAt;
  void updatedAt;
  return { id: snapshot.id, ...project };
}

export async function listProjects() {
  const snapshot = await projectsCollection.orderBy("startDate", "desc").get();
  return snapshot.docs.map(projectFromSnapshot);
}

export async function getProject(id: string) {
  const snapshot = await projectsCollection.doc(id).get();
  return snapshot.exists ? projectFromSnapshot(snapshot) : null;
}

export async function createProject(project: Omit<Project, "id">, id?: string) {
  const reference = id ? projectsCollection.doc(id) : projectsCollection.doc();
  await reference.set({ ...project, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
  return { id: reference.id, ...project };
}

export async function updateProject(id: string, project: Partial<Omit<Project, "id">>) {
  await projectsCollection.doc(id).set({ ...project, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  return getProject(id);
}

export async function deleteProject(id: string) {
  await projectsCollection.doc(id).delete();
}
