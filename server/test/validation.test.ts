import { describe, expect, test } from '@jest/globals';
import { HttpError } from '../src/errors';
import { parseId, positiveInteger, validateBody, validateName } from '../src/validation';

function expectBadRequest(fn: () => unknown) {
  expect(() => fn()).toThrow(HttpError);
  try {
    fn();
  } catch (error) {
    expect(error).toBeInstanceOf(HttpError);
    expect((error as HttpError).statusCode).toBe(400);
  }
}

describe('validation', () => {
  test.each([1, 2147483647])('positiveInteger accepts %p', (value) => {
    expect(positiveInteger(value, 'RA')).toBe(value);
  });

  test.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, 2147483648, '123', null, undefined])(
    'positiveInteger rejects %p',
    (value) => {
      expectBadRequest(() => positiveInteger(value as never, 'RA'));
    },
  );

  test.each(['1', '2147483647'])('parseId converts %p', (value) => {
    expect(parseId(value, 'RA')).toBe(Number(value));
  });

  test.each(['1abc', '1.2', '1e2', '', '-1', '0', '2147483648', 123])(
    'parseId rejects %p',
    (value) => {
      expectBadRequest(() => parseId(value as never, 'RA'));
    },
  );

  test.each(['Ana', 'a'.repeat(100)])('validateName accepts %p', (value) => {
    expect(validateName(value)).toBe(value);
  });

  test.each(['', 'ab', '   ', ' a ', 'a'.repeat(101), 123, null, undefined])(
    'validateName rejects %p',
    (value) => {
      expectBadRequest(() => validateName(value as never));
    },
  );

  test('validateBody returns the same object reference for a valid frozen body', () => {
    const payload = Object.freeze({ name: 'Ana' });
    expect(validateBody(payload)).toBe(payload);
  });

  test.each([null, undefined, [], 'Ana', 12])('validateBody rejects %p', (value) => {
    expectBadRequest(() => validateBody(value as never));
  });

  test('validateBody accepts extra fields and preserves the original object reference', () => {
    const payload = { name: 'Ana', extra: true };
    expect(validateBody(payload)).toBe(payload);
  });
});
