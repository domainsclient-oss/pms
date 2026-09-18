import { FieldValue, type DocumentSnapshot } from "firebase-admin/firestore";
import { auth, firestore } from "@/lib/firebase-admin";
import { User } from "@/lib/types";

const usersCollection = firestore.collection("users");

function userFromSnapshot(snapshot: DocumentSnapshot): User {
  const { createdAt: _createdAt, ...user } = snapshot.data() as Omit<User, "id"> & { createdAt?: unknown };
  void _createdAt;
  return { id: snapshot.id, ...user };
}

export async function listUsers() {
  const snapshot = await usersCollection.orderBy("createdDate", "desc").get();
  return snapshot.docs.map(userFromSnapshot);
}

export async function getUser(id: string) {
  const snapshot = await usersCollection.doc(id).get();
  return snapshot.exists ? userFromSnapshot(snapshot) : null;
}

export async function createUser(user: Omit<User, "id">, password: string) {
  const authUser = await auth.createUser({ email: user.email, password, displayName: user.name });
  try {
    await usersCollection.doc(authUser.uid).set({ ...user, createdAt: FieldValue.serverTimestamp() });
  } catch (error) {
    await auth.deleteUser(authUser.uid);
    throw error;
  }
  return { id: authUser.uid, ...user };
}

export async function updateUser(id: string, user: Partial<Omit<User, "id">>) {
  await usersCollection.doc(id).set(user, { merge: true });
  if (user.name || user.email) {
    await auth.updateUser(id, { ...(user.name && { displayName: user.name }), ...(user.email && { email: user.email }) }).catch(() => {});
  }
  return getUser(id);
}

export async function deleteUser(id: string) {
  await usersCollection.doc(id).delete();
  await auth.deleteUser(id).catch(() => {});
}
