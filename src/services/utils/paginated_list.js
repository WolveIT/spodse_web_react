import Firestore from "../firestore";

export class PaginatedList {
  constructor({ basicQuery, perBatch }) {
    this.last = null;
    this.perBatch = perBatch || 10;
    this.noMore = false;
    this.basicQuery = basicQuery;
  }

  get_next = async () => {
    if (this.noMore) return [];
    let query = this.basicQuery;
    if (this.last) query = query.startAfter(this.last);
    const snap = await Firestore.get_list(query.limit(this.perBatch));
    if (snap.docs.length === 0) this.noMore = true;
    else this.last = snap.docs[snap.docs.length - 1]._original;
    return snap.docs;
  };
}
