import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { auth } from './firebase'

export type ClinicianClaims = {
  hospitalId: string
  role: 'physician' | 'nurse' | 'allied-health' | 'administrator'
}

export const signInClinician = async (email: string, password: string) => {
  await setPersistence(auth, browserLocalPersistence)
  return signInWithEmailAndPassword(auth, email, password)
}

export const signOutClinician = () => signOut(auth)

export const observeClinician = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, callback)

export const getClinicianClaims = async (
  user: User,
): Promise<ClinicianClaims> => {
  const token = await user.getIdTokenResult()
  const { hospitalId, role } = token.claims
  if (typeof hospitalId !== 'string' || typeof role !== 'string') {
    throw new Error('Clinician account is missing required access claims')
  }
  return { hospitalId, role: role as ClinicianClaims['role'] }
}
