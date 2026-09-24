export const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.';
export const SERVER_ERROR_MESSAGE = 'A server error occurred. Please try again later.';
export const NETWORK_ERROR_MESSAGE =
  'Unable to reach the server. Check your connection and try again.';

export const CODE_BY_STATUS: ReadonlyMap<number, string> = new Map([
  [400, 'bad_request'],
  [401, 'unauthorized'],
  [403, 'forbidden'],
  [404, 'not_found'],
  [409, 'conflict'],
  [422, 'validation_failed'],
]);

export const MESSAGE_BY_STATUS: ReadonlyMap<number, string> = new Map([
  [400, 'The request was invalid.'],
  [401, 'Your session has expired. Please sign in again.'],
  [403, 'You do not have permission to perform this action.'],
  [404, 'The requested resource was not found.'],
  [409, 'This action conflicts with the current state. Please refresh and retry.'],
  [422, 'Please correct the highlighted fields.'],
]);
