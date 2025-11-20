// firestore.ts
import type { Place, Reservation, Profile, Comment } from "../types";
import { getAuth } from "firebase/auth";

/**
 * Obtiene el token de Firebase para autenticación con backend.
 */
async function getUserToken(): Promise<string> {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Usuario no autenticado.");
  return await user.getIdToken();
}

/**
 * Manejo general de respuestas de fetch
 */
async function handleResponse(response: Response) {
  if (!response.ok) {
    const text = await response.text();
    let msg = `HTTP ${response.status}`;
    try {
      const json = JSON.parse(text);
      msg = json.message || json.error || msg;
    } catch {}
    throw new Error(msg);
  }
  return response.json();
}

/* ====================== CANCHAS ====================== */

export async function saveCanchas(newCanchas: Place[], oldCanchas: Place[]) {
  const token = await getUserToken();

  const newIds = new Set(newCanchas.map(c => `cancha-${c.id}`));
  const idsToDelete = oldCanchas
    .map(c => `cancha-${c.id}`)
    .filter(id => !newIds.has(id));

  await fetch("https://zero-lio-backend.onrender.com/api/canchas/store", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ canchasToUpdate: newCanchas, idsToDelete }),
  }).then(handleResponse);
}

export async function fetchSavedCanchas(): Promise<Place[]> {
  const token = await getUserToken();
  return fetch("https://zero-lio-backend.onrender.com/api/canchas/saved", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  }).then(handleResponse);
}

/* ====================== RESERVAS ====================== */

export async function saveReservations(newReservations: Reservation[], oldReservations: Reservation[]) {
  const token = await getUserToken();

  const newIds = new Set(newReservations.map(r => `reservation-${r.datetime.getTime()}`));
  const idsToDelete = oldReservations
    .map(r => `reservation-${r.datetime.getTime()}`)
    .filter(id => !newIds.has(id));

  await fetch("https://zero-lio-backend.onrender.com/api/reservations/store", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reservationsToUpdate: newReservations, idsToDelete }),
  }).then(handleResponse);
}

export async function fetchSavedReservations(): Promise<Reservation[]> {
  const token = await getUserToken();
  return fetch("https://zero-lio-backend.onrender.com/api/reservations/saved", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  }).then(handleResponse);
}

/* ====================== USUARIO ====================== */

export async function fetchUserInfo(): Promise<Profile> {
  const token = await getUserToken();
  return fetch("https://zero-lio-backend.onrender.com/user/settings/info", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  }).then(handleResponse);
}

export async function saveUserInfo(profile: Profile) {
  const token = await getUserToken();
  await fetch("https://zero-lio-backend.onrender.com/user/settings/edit", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ profile }),
  }).then(handleResponse);
}

/* ====================== COMENTARIOS ====================== */

export async function postComment(comment: Comment) {
  const token = await getUserToken();
  await fetch("https://zero-lio-backend.onrender.com/api/comments/post", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ comment }),
  }).then(handleResponse);
}

export async function postReply(reply: Comment) {
  const token = await getUserToken();
  await fetch("https://zero-lio-backend.onrender.com/api/comments/reply", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reply }),
  }).then(handleResponse);
}

export async function fetchAllComments(): Promise<Comment[]> {
  const token = await getUserToken();
  return fetch("https://zero-lio-backend.onrender.com/api/comments/all", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  }).then(handleResponse);
}
