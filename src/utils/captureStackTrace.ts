/**
 * If `captureStackTrace` is supported in the browser, the function is used.
 * Otherwise an alternative is used so there are no errors thrown.
 *
 * `error`: the error of which the StackTrace should be captured.
 * `toOmit`: if given, all frames above toOmit, including toOmit, will be omitted from the generated stack trace.
 * @see More information: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/captureStackTrace
 */
export function captureStackTrace(
  error: Error,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  toOmit?: Function,
) {
  if ('captureStackTrace' in Error) {
    Error.captureStackTrace(error, toOmit);
  } else {
    Object.defineProperty(error, 'stack', {
      enumerable: false,
      value: error.stack,
    });
  }
}
