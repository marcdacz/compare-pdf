declare namespace _default {
    export { comparePdfByBase64 };
}
export default _default;
export type CompareDetails = import("./typeDefs.js").CompareDetails;
export type Results = import("./typeDefs.js").Results;
/**
 * @typedef {import("./typeDefs.js").CompareDetails} CompareDetails
 * @typedef {import("./typeDefs.js").Results} Results
 */
/**************************************************
 *
 * @param {CompareDetails} compareDetails
 * @return {Promise<Results>}
 */
declare function comparePdfByBase64(compareDetails: CompareDetails): Promise<Results>;
