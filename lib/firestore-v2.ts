// Typed read/write helpers for v2 collections with Zod validation on writes.

import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import type { ZodType } from 'zod';
import { db } from './firebase';

export type SaveResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: Record<string, string>; messages: string[] };

export async function listAll<T>(collectionName: string): Promise<Array<{ id: string; data: T }>> {
  const snap = await getDocs(collection(db, collectionName));
  return snap.docs.map((d) => ({ id: d.id, data: d.data() as T }));
}

export async function saveValidated<T>(
  collectionName: string,
  id: string,
  candidate: unknown,
  schema: ZodType<T>,
): Promise<SaveResult<T>> {
  const result = schema.safeParse(candidate);
  if (!result.success) {
    const errors: Record<string, string> = {};
    const messages: string[] = [];
    for (const issue of result.error.issues) {
      const path = issue.path.join('.') || '_root';
      errors[path] = issue.message;
      messages.push(`${path}: ${issue.message}`);
    }
    return { ok: false, errors, messages };
  }
  await setDoc(doc(db, collectionName, id), result.data as Record<string, unknown>);
  return { ok: true, data: result.data };
}

export async function removeDoc(collectionName: string, id: string): Promise<void> {
  await deleteDoc(doc(db, collectionName, id));
}
