export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Authentication required/.test(error.message) ||
         /^401: .*Unauthorized/.test(error.message);
}