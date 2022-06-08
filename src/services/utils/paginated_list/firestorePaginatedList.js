import Firestore from "../../firestore";

export default class FirestorePaginatedList {
  constructor({ baseQuery, perBatch }) {
    this.last = null;
    this.perBatch = perBatch || 10;
    this.noMore = false;
    this.baseQuery = baseQuery;
  }

  get_next = async () => {
    console.debug("Firestore get next called");
    if (this.noMore) return [];
    let query = this.baseQuery;
    if (this.last) query = query.startAfter(this.last);
    const snap = await Firestore.get_list(query.limit(this.perBatch));
    if (snap.docs.length === 0) this.noMore = true;
    else this.last = snap.docs[snap.docs.length - 1]._original;
    return snap.docs;
  };
}
