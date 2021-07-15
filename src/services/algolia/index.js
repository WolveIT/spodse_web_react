import algoliasearch from "algoliasearch";

const algolia = algoliasearch("W155KT1SHK", "0e8a2ac2f37ac5eba58e5a1e88aee5bf");
const users = algolia.initIndex("users");

const Algolia = {
  client: algolia,
  users,
};

export default Algolia;
