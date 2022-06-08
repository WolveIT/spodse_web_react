export default class AlgoliaPaginatedList {
  constructor({ searchTerm, searchOptions = {}, index, perBatch }) {
    this.page = 0;
    this.perBatch = perBatch || 10;
    this.noMore = false;
    this.searchTerm = searchTerm;
    this.searchOptions = searchOptions;
    this.index = index;
  }

  get_next = async () => {
    console.debug("Algolia get next called");
    if (this.noMore) return [];
    const res = await this.index.search(this.searchTerm, {
      ...this.searchOptions,
      page: this.page,
      hitsPerPage: this.perBatch,
    });
    const { hits } = res;
    if (hits.length === 0) this.noMore = true;
    else this.page++;
    return hits.map((hit) => {
      hit.id = hit.objectID;
      return hit;
    });
  };
}
