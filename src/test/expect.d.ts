import {Transform} from "./core/core";

export {};

declare global {
  namespace jest {
    // bug: this is definitely used, maybe this is is an typescript-eslint bug?
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Matchers<R> {
      toEqualTransform(expected: Transform): CustomMatcherResult
    }
  }
}
