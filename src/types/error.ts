export interface OctokitError extends Error {
    status: number;
}