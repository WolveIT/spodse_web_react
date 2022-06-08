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
    arr.push(randString(16));
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
    closesAt: data.closesAt || data.endsAt,
    genre: data.genre,
    sponsorImages: data.sponsorImages || [],
    images: data.images || [],
    logoImage: data.logoImage || null,
    location: data.location,
    maxAttendees: data.ticketAnswer
      ? data.maxAttendees
      : data.maxAttendees || Infinity,
    title: data.title,
    organizerId: currUser().uid,
    isPrivate: data.isPrivate,
    tags: data.tags || [],
    ticketAnswer: data.ticketAnswer,
    ticketPrice: data.ticketPrice || 0,
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
    data.closesAt &&
    (data.closesAt.getTime() < Date.now() ||
      data.closesAt.getTime() > data.endsAt.getTime())
  )
    throw new Error(
      `Registration deadline must be a date/time in future and less than event's end date/time`
    );

  progress = typeof progress === "function" ? progress : () => {};
  const eventRef = refs.events.doc();
  data.eventId = eventRef.id;

  //upload images
  const _seed = randomNumber(0.9, 0.95);
  const totalImages =
    data.images.length + data.logoImage.length + data.sponsorImages.length;
  let currProgress = 0;

  data.images = await Storage.upload(
    { uploadPath: `/EventImages/${data.eventId}/`, files: data.images },
    (v) => {
      progress(((v * data.images.length) / totalImages) * _seed);
    }
  );
  currProgress += 100 * (data.images.length / totalImages) * _seed;

  const hasMainSponsor = data.sponsorImages[0] === null;
  data.sponsorImages = await Storage.upload(
    {
      uploadPath: `/EventImages/${data.eventId}/sponsors/`,
      files: data.sponsorImages.filter((item) => item instanceof File),
    },
    (v) => {
      progress(
        currProgress + ((v * data.sponsorImages.length) / totalImages) * _seed
      );
    }
  );
  if (!hasMainSponsor && data.sponsorImages.length)
    data.sponsorImages.unshift(null);
  currProgress += 100 * (data.sponsorImages.length / totalImages) * _seed;

  data.logoImage = await Storage.upload(
    { uploadPath: `/EventImages/${data.eventId}/logo/`, files: data.logoImage },
    (v) => {
      progress(
        currProgress + ((v * data.logoImage.length) / totalImages) * _seed
      );
    }
  );
  if (data.logoImage?.length) data.logoImage = data.logoImage[0];
  currProgress = _seed * 100;

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
    progress(currProgress + randomInt(1, 3));
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
  const _seed = randomNumber(0.9, 0.95);
  data.images = Array.isArray(data.images) ? data.images : [];
  data.sponsorImages = Array.isArray(data.sponsorImages)
    ? data.sponsorImages
    : [];
  data.logoImage = Array.isArray(data.logoImage) ? data.logoImage : [];

  const imagesToUpload = data.images?.filter((img) => img instanceof File);
  const sponsorImagesToUpload = data.sponsorImages?.filter(
    (img) => img instanceof File
  );
  const logoImageToUpload = data.logoImage?.filter(
    (img) => img instanceof File
  );

  const totalImages =
    imagesToUpload.length +
    sponsorImagesToUpload.length +
    logoImageToUpload.length;
  let currProgress = 0;

  const images = await Storage.upload(
    {
      uploadPath: `/EventImages/${data.eventId}/`,
      files: imagesToUpload,
    },
    (v) => progress(((v * imagesToUpload.length) / totalImages) * _seed)
  );
  currProgress += ((100 * imagesToUpload.length) / totalImages) * _seed;
  for (const img of data.images) {
    if (img instanceof File) continue;
    images.push(img.src);
  }
  data.images = images;

  const sponsorImages = await Storage.upload(
    {
      uploadPath: `/EventImages/${data.eventId}/sponsors/`,
      files: sponsorImagesToUpload,
    },
    (v) =>
      progress(
        currProgress +
          ((v * sponsorImagesToUpload.length) / totalImages) * _seed
      )
  );
  currProgress += ((100 * sponsorImagesToUpload.length) / totalImages) * _seed;
  let sponsorCount = 0;
  for (let i = 0; i < data.sponsorImages.length; ++i) {
    const img = data.sponsorImages[i];
    if (img instanceof File)
      data.sponsorImages[i] = sponsorImages[sponsorCount++];
    else if (img?.src) data.sponsorImages[i] = img.src;
  }

  const logoImage = await Storage.upload(
    {
      uploadPath: `/EventImages/${data.eventId}/logo/`,
      files: logoImageToUpload,
    },
    (v) =>
      progress(
        currProgress + ((v * logoImageToUpload.length) / totalImages) * _seed
      )
  );
  currProgress = _seed * 100;
  for (const img of data.logoImage) {
    if (img instanceof File) continue;
    logoImage.push(img.src);
  }
  data.logoImage = logoImage?.length ? logoImage[0] : null;

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

async function update_invite_perks({ eventId, inviteId, perks }) {
  const updates = {};
  Object.entries(perks || {}).forEach(([perk, val]) => {
    if (Number.isInteger(val?.allotted))
      updates[`perks.${perk}`] = `p-${val.allotted}`;
  });

  if (Object.keys(updates).length > 0)
    return refs.eventInvites(eventId).doc(inviteId).update(updates);
}

async function update_ticket_perks({ eventId, ticketId, perks }) {
  const updates = {};
  Object.entries(perks || {}).forEach(([perk, val]) => {
    if (Number.isInteger(val?.allotted))
      updates[`perks.${perk}.allotted`] = val.allotted;
  });

  if (Object.keys(updates).length > 0)
    return refs.eventTickets(eventId).doc(ticketId).update(updates);
}

function resend_invite({ invitationId, eventId, message }) {
  return functions().httpsCallable("eventResendInvite")({
    invitationId,
    eventId,
    message,
  });
}

function resend_invite_all({ eventId, message }) {
  return functions().httpsCallable("eventResendInviteAll")({
    eventId,
    message,
  });
}

function send_ticket({ eventId, invitationId, email, phone }) {
  return functions().httpsCallable("eventSendTicket")({
    eventId,
    invitationId,
    email,
    phone,
  });
}

async function get_ticket_link({ eventId, invitationId }) {
  const res = await functions().httpsCallable("eventGetTicketLink")({
    eventId,
    invitationId,
  });
  return res.data;
}

const Event = {
  create,
  update,
  invite_users,
  remove_invited,
  add_validators,
  remove_validator,
  remove_user,
  update_invite_perks,
  update_ticket_perks,
  resend_invite,
  resend_invite_all,
  send_ticket,
  get_ticket_link,
  delete: _delete,
};

export default Event;
