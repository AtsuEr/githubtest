// @vitest-environment node
import { readFileSync } from 'node:fs'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore'
import { afterAll, afterEach, beforeAll, describe, it } from 'vitest'

const projectId = 'carenote-rules-test'
let testEnvironment: RulesTestEnvironment

const claims = (hospitalId: string, role = 'physician') => ({
  hospitalId,
  role,
})

const draftNote = (authorId = 'clinician-a') => ({
  hospitalId: 'hospital-a',
  patientId: 'patient-1',
  encounterId: 'encounter-1',
  type: 'Progress note',
  title: 'Initial assessment',
  body: 'Patient is alert and stable.',
  status: 'draft',
  authorId,
  authorName: 'Dr. Ada Clinician',
  createdAt: Timestamp.fromMillis(1),
  updatedAt: Timestamp.fromMillis(1),
})

const seedNote = async (
  noteId: string,
  data: Record<string, unknown> = draftNote(),
) => {
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'clinicalNotes', noteId), data)
  })
}

beforeAll(async () => {
  testEnvironment = await initializeTestEnvironment({
    projectId,
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
    },
  })
})

afterEach(async () => {
  await testEnvironment.clearFirestore()
})

afterAll(async () => {
  await testEnvironment.cleanup()
})

describe('clinical note tenant isolation', () => {
  it('allows a clinician to read a note in their hospital', async () => {
    await seedNote('note-1')
    const db = testEnvironment
      .authenticatedContext('clinician-a', claims('hospital-a'))
      .firestore()

    await assertSucceeds(getDoc(doc(db, 'clinicalNotes', 'note-1')))
  })

  it('denies unauthenticated and cross-hospital reads', async () => {
    await seedNote('note-1')
    const unauthenticated = testEnvironment.unauthenticatedContext().firestore()
    const otherHospital = testEnvironment
      .authenticatedContext('clinician-b', claims('hospital-b'))
      .firestore()

    await assertFails(getDoc(doc(unauthenticated, 'clinicalNotes', 'note-1')))
    await assertFails(getDoc(doc(otherHospital, 'clinicalNotes', 'note-1')))
  })
})

describe('clinical note lifecycle', () => {
  it('allows an author to create a server-timestamped draft', async () => {
    const db = testEnvironment
      .authenticatedContext('clinician-a', claims('hospital-a'))
      .firestore()

    await assertSucceeds(
      setDoc(doc(db, 'clinicalNotes', 'note-1'), {
        ...draftNote(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    )
  })

  it('denies creating a signed note or impersonating another author', async () => {
    const db = testEnvironment
      .authenticatedContext('clinician-a', claims('hospital-a'))
      .firestore()

    await assertFails(
      setDoc(doc(db, 'clinicalNotes', 'signed-note'), {
        ...draftNote(),
        status: 'signed',
        signedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    )
    await assertFails(
      setDoc(doc(db, 'clinicalNotes', 'forged-note'), {
        ...draftNote('clinician-b'),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    )
  })

  it('allows only the author to edit a draft', async () => {
    await seedNote('note-1')
    const authorDb = testEnvironment
      .authenticatedContext('clinician-a', claims('hospital-a'))
      .firestore()
    const colleagueDb = testEnvironment
      .authenticatedContext('clinician-b', claims('hospital-a', 'nurse'))
      .firestore()

    await assertSucceeds(
      updateDoc(doc(authorDb, 'clinicalNotes', 'note-1'), {
        body: 'Patient remains stable after reassessment.',
        updatedAt: serverTimestamp(),
      }),
    )
    await assertFails(
      updateDoc(doc(colleagueDb, 'clinicalNotes', 'note-1'), {
        body: 'Unauthorized edit.',
        updatedAt: serverTimestamp(),
      }),
    )
  })

  it('prevents changing a note patient, author, or hospital', async () => {
    await seedNote('note-1')
    const db = testEnvironment
      .authenticatedContext('clinician-a', claims('hospital-a'))
      .firestore()
    const noteRef = doc(db, 'clinicalNotes', 'note-1')

    await assertFails(updateDoc(noteRef, { patientId: 'patient-2', updatedAt: serverTimestamp() }))
    await assertFails(updateDoc(noteRef, { authorId: 'clinician-b', updatedAt: serverTimestamp() }))
    await assertFails(updateDoc(noteRef, { hospitalId: 'hospital-b', updatedAt: serverTimestamp() }))
  })

  it('allows the author to sign once and makes the note immutable', async () => {
    await seedNote('note-1')
    const db = testEnvironment
      .authenticatedContext('clinician-a', claims('hospital-a'))
      .firestore()
    const noteRef = doc(db, 'clinicalNotes', 'note-1')

    await assertSucceeds(
      updateDoc(noteRef, {
        status: 'signed',
        signedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    )
    await assertFails(
      updateDoc(noteRef, {
        body: 'Changed after signature.',
        updatedAt: serverTimestamp(),
      }),
    )
    await assertFails(
      updateDoc(noteRef, {
        status: 'draft',
        updatedAt: serverTimestamp(),
      }),
    )
  })
})

describe('patient and audit controls', () => {
  it('allows only administrators to create patient records', async () => {
    const physicianDb = testEnvironment
      .authenticatedContext('clinician-a', claims('hospital-a'))
      .firestore()
    const administratorDb = testEnvironment
      .authenticatedContext('admin-a', claims('hospital-a', 'administrator'))
      .firestore()
    const patient = { hospitalId: 'hospital-a', name: 'Test Patient' }

    await assertFails(setDoc(doc(physicianDb, 'patients', 'patient-1'), patient))
    await assertSucceeds(setDoc(doc(administratorDb, 'patients', 'patient-1'), patient))
  })

  it('denies all client writes to the audit log', async () => {
    const administratorDb = testEnvironment
      .authenticatedContext('admin-a', claims('hospital-a', 'administrator'))
      .firestore()

    await assertFails(
      setDoc(doc(administratorDb, 'auditEvents', 'event-1'), {
        hospitalId: 'hospital-a',
        action: 'note.read',
      }),
    )
  })
})
