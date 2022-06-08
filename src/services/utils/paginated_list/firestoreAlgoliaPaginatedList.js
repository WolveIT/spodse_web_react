import AlgoliaPaginatedList from "./algoliaPaginatedList";
import FirestorePaginatedList from "./firestorePaginatedList";

export default class FirestoreAlgoliaPaginatedList {
  constructor({ baseQuery, searchTerm, searchOptions = {}, index, perBatch }) {
    this.list = searchTerm
      ? new AlgoliaPaginatedList({ searchTerm, searchOptions, index, perBatch })
      : new FirestorePaginatedList({ baseQuery, perBatch });
  }

  get_next = () => this.list.get_next();
}
