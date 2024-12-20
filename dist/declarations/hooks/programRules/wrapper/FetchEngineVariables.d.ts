/**
 * A function to fetch the required variables to run program rules.
 * @param {string[]} programs - An array of strings whith the required program ids.
 * @returns {{loading: boolean; error: boolean; }}
 */
export default function FetchEngineVariables(programs: string[]): {
    error: boolean;
    loading: boolean;
};
