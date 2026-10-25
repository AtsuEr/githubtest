import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { db } from './firebase'

export type ClinicalNoteStatus = 'draft' | 'signed'

export type ClinicalNoteRecord = {
  id: string
  hospitalId: string
  patientId: string
  encounterId: string
  type: string
  title: string
  body: string
  status: ClinicalNoteStatus
  authorId: string
  authorName: string
  createdAt: Date
  updatedAt: Date
  signedAt?: Date
}

export type CreateClinicalNote = Omit<
  ClinicalNoteRecord,
  'id' | 'createdAt' | 'updatedAt' | 'signedAt'
>

const mapNote = (
  document: QueryDocumentSnapshot<DocumentData>,
): ClinicalNoteRecord => {
  const data = document.data()
  return {
    id: document.id,
    hospitalId: data.hospitalId,
    patientId: data.patientId,
    encounterId: data.encounterId,
    type: data.type,
    title: data.title,
    body: data.body,
    status: data.status,
    authorId: data.authorId,
    authorName: data.authorName,
    createdAt: data.createdAt?.toDate() ?? new Date(),
    updatedAt: data.updatedAt?.toDate() ?? new Date(),
    signedAt: data.signedAt?.toDate(),
  }
}

export const listPatientNotes = async (
  hospitalId: string,
  patientId: string,
): Promise<ClinicalNoteRecord[]> => {
  const notesQuery = query(
    collection(db, 'clinicalNotes'),
    where('hospitalId', '==', hospitalId),
    where('patientId', '==', patientId),
    orderBy('createdAt', 'desc'),
    limit(100),
  )
  const snapshot = await getDocs(notesQuery)
  return snapshot.docs.map(mapNote)
}

export const createClinicalNote = async (
  note: CreateClinicalNote,
): Promise<string> => {
  const document = await addDoc(collection(db, 'clinicalNotes'), {
    ...note,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return document.id
}

export const signClinicalNote = async (
  note: ClinicalNoteRecord,
): Promise<void> => {
  if (note.status === 'signed') return
  await updateDoc(doc(db, 'clinicalNotes', note.id), {
    status: 'signed',
    signedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}
