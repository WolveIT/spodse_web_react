import Storage from "../storage";
import { delay, randomInt, randomNumber, randString } from "../utils/utils";
import Papa from "papaparse";
import {
  currUser,
  db,
  refs,
  serverTimestamp,
  functions,
} from "../utils/firebase_config";

const BC = true; //whether backwards compatible or not

async function generateTickets(qty) {
  const arr = [];
  for (let i = 0; i < qty; ++i) {
    arr.push(randString(10));
  }
  return arr;
}

async function parseTickets(csvFile) {
  return new Promise((res, rej) => {
    Papa.parse(csvFile, {
      complete: (parsed) =>
        res(parsed.data.map((row) => row[0]).filter((str) => str.length > 0)),
      error: rej,
    });
  });
}

function get_new_event_doc(data) {
  const doc = {
    ageLimit: data.ageLimit || null,
    attendeesCount: 0,
    description: data.description || "",
    startsAt: data.startsAt,
    endsAt: data.endsAt,
    closesAt: data.closesAt,
    genre: data.genre,
    images: data.images || [],
    location: data.location,
    maxAttendees: data.maxAttendees,
    title: data.title,
    organizerId: currUser().uid,
    isPrivate: data.isPrivate,
    tags: data.tags || [],
    ticketAnswer: data.ticketAnswer,
    perks: data.perks || {},
    likes: {},
    stats: {
      totalInvited: 0,
      totalInvitesAccepted: 0,
      totalValidators: 0,
      totalWent: 0,
      totalPerksConsumed: {},
    },
    createdAt: serverTimestamp(),
  };

  if (BC) {
    doc.attenders = [];
    doc.count = 0;
    doc.date = doc.startsAt;
    doc.endDate = doc.endsAt;
    doc.max_attemders = doc.maxAttendees;
    doc.name = doc.title;
    doc.organizer = doc.organizerId;
    doc.private = doc.isPrivate;
    doc.timestamp = doc.createdAt;
    doc.tickets = "44743ca8-e79e-40a0-8bc5-b1656cec2b2a";
  }

  return doc;
}

function get_new_event_tickets_doc(data) {
  const ticketsMap = {};
  data.tickets.forEach((ticket) => (ticketsMap[ticket] = null));
  return ticketsMap;
}

async function create(data, progress) {
  if (
    data.closesAt.getTime() < Date.now() ||
    data.closesAt.getTime() > data.endsAt.getTime() + 60000
  )
    throw new Error(
      `Registration deadline must be a date/time in future and less than event's end date/time`
    );

  progress = typeof progress === "function" ? progress : () => {};
  const eventRef = refs.events.doc();
  data.eventId = eventRef.id;

  //upload images
  const _seed = randomNumber(0.85, 0.95);
  data.images = await Storage.upload(
    { uploadPath: `/EventImages/${data.eventId}/`, files: data.images },
    (v) => progress(v * _seed)
  );

  //generate ticket
  if (data.ticketAnswer) {
    if (data.ticketAnswer === "internal")
      data.tickets = await generateTickets(data.maxAttendees);
    else if (data.ticketAnswer === "external")
      data.tickets = await parseTickets(data.externalTicketsFile);

    if (data.tickets.length !== data.maxAttendees)
      throw new Error(
        `No. of tickets should match the Attendees Limit!\nAttendees Limit: ${data.maxAttendees}, Tickets provides: ${data.tickets.length}`
      );
    progress(_seed * 100 + randomInt(1, 5));
  }

  //create event in DB
  const batch = db().batch();
  batch.set(eventRef, get_new_event_doc(data));
  if (data.ticketAnswer && data.tickets.length)
    batch.set(
      refs.eventTicketsList(data.eventId),
      get_new_event_tickets_doc(data)
    );
  await batch.commit();
  progress(100);
  await delay(200);
  return data.eventId;
}

async function update(data, progress) {
  if (data.closesAt.getTime() > data.endsAt.getTime() + 60000)
    throw new Error(
      `Registration deadline must be a date/time less than event's end date/time`
    );

  progress = typeof progress === "function" ? progress : () => {};

  //upload images (if any)
  const _seed = randomNumber(0.85, 0.95);
  const images = await Storage.upload(
    {
      uploadPath: `/EventImages/${data.eventId}/`,
      files: data.images.filter((img) => img instanceof File),
    },
    (v) => progress(v * _seed)
  );
  for (const img of data.images) {
    if (img instanceof File) continue;
    images.push(img.src);
  }
  data.images = images;

  //update document in DB
  const newData = get_new_event_doc(data);
  delete newData.attendeesCount;
  delete newData.organizerId;
  delete newData.ticketAnswer;
  delete newData.likes;
  delete newData.stats;
  delete newData.createdAt;
  await refs.events.doc(data.eventId).set(newData, { merge: true });
  progress(100);
  await delay(200);
  return data.eventId;
}

async function _delete(eventId) {
  return functions().httpsCallable("eventDelete")({ eventId });
}

async function invite_users({ eventId, emails, message, perks }) {
  return functions().httpsCallable("createMultipleEventInvites")({
    eventId,
    emails,
    message,
    perks,
  });
}

export function remove_invited({ invitationId, eventId }) {
  return functions().httpsCallable("eventRemoveInvite")({
    eventId,
    invitationId,
  });
}

async function add_validators({ uids, eventId }) {
  return functions().httpsCallable("eventAddValidators")({
    eventId,
    uids,
  });
}

export function remove_validator({ uid, eventId }) {
  return functions().httpsCallable("eventRemoveValidator")({
    eventId,
    uid,
  });
}

export function remove_user({ uid, eventId }) {
  return functions().httpsCallable("eventRemoveUser")({
    eventId,
    uid,
  });
}

const Event = {
  create,
  update,
  invite_users,
  remove_invited,
  add_validators,
  remove_validator,
  remove_user,
  delete: _delete,
};

export default Event;
