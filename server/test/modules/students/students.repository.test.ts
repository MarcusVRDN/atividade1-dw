import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { PgStudentRepository } from '../../../src/modules/students/students.repository';

function normalizeSql(sql: string) {
  return sql.replace(/\s+/g, ' ').trim();
}

describe('PgStudentRepository', () => {
  let query: any;
  let repo: PgStudentRepository;

  beforeEach(() => {
    query = jest.fn();
    repo = new PgStudentRepository({ query } as any);
  });

  test('create inserts the student and returns the created row', async () => {
    const created = { ra: 123, name: 'Ana' };
    query.mockResolvedValue({ rows: [created] });

    await expect(repo.create({ ra: 123, name: 'Ana' })).resolves.toEqual(created);
    expect(query).toHaveBeenCalledTimes(1);
    expect(normalizeSql(query.mock.calls[0][0])).toBe('INSERT INTO students (ra, name) VALUES ($1, $2) RETURNING ra, name');
    expect(query.mock.calls[0][1]).toEqual([123, 'Ana']);
  });

  test('findAll returns the rows in order', async () => {
    const rows = [{ ra: 123, name: 'Ana' }, { ra: 456, name: 'Bruno' }];
    query.mockResolvedValue({ rows });

    await expect(repo.findAll()).resolves.toEqual(rows);
    expect(query).toHaveBeenCalledTimes(1);
    expect(normalizeSql(query.mock.calls[0][0])).toBe('SELECT ra, name FROM students ORDER BY name');
    expect(query.mock.calls[0]).toHaveLength(1);
  });

  test('findAll returns an empty list when there are no rows', async () => {
    query.mockResolvedValue({ rows: [] });

    await expect(repo.findAll()).resolves.toEqual([]);
  });

  test('findOne returns the first matching row', async () => {
    const row = { ra: 123, name: 'Ana' };
    query.mockResolvedValue({ rows: [row] });

    await expect(repo.findOne(123)).resolves.toEqual(row);
    expect(query).toHaveBeenCalledTimes(1);
    expect(normalizeSql(query.mock.calls[0][0])).toBe('SELECT ra, name FROM students WHERE ra = $1');
    expect(query.mock.calls[0][1]).toEqual([123]);
  });

  test('findOne returns undefined when no row matches', async () => {
    query.mockResolvedValue({ rows: [] });

    await expect(repo.findOne(123)).resolves.toBeUndefined();
  });

  test('create propagates database errors as the same instance', async () => {
    const error = new Error('db down');
    query.mockRejectedValue(error);

    await expect(repo.create({ ra: 123, name: 'Ana' })).rejects.toBe(error);
  });

  test('findAll propagates database errors as the same instance', async () => {
    const error = new Error('db down');
    query.mockRejectedValue(error);

    await expect(repo.findAll()).rejects.toBe(error);
  });

  test('findOne propagates database errors as the same instance', async () => {
    const error = new Error('db down');
    query.mockRejectedValue(error);

    await expect(repo.findOne(123)).rejects.toBe(error);
  });
});
