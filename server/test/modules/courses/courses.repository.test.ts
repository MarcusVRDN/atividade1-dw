import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { PgCourseRepository } from '../../../src/modules/courses/courses.repository';

function normalizeSql(sql: string) {
  return sql.replace(/\s+/g, ' ').trim();
}

describe('PgCourseRepository', () => {
  let query: any;
  let repo: PgCourseRepository;

  beforeEach(() => {
    query = jest.fn();
    repo = new PgCourseRepository({ query } as any);
  });

  test('create inserts the course and returns the created row', async () => {
    const created = { id: 1, name: 'Qualidade' };
    query.mockResolvedValue({ rows: [created] });

    await expect(repo.create({ name: 'Qualidade' })).resolves.toEqual(created);
    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0][0]).toBe('INSERT INTO courses (name) VALUES ($1) RETURNING id, name');
    expect(query.mock.calls[0][1]).toEqual(['Qualidade']);
  });

  test('findAll returns the rows in order', async () => {
    const rows = [{ id: 1, name: 'Qualidade' }, { id: 2, name: 'Banco de dados' }];
    query.mockResolvedValue({ rows });

    await expect(repo.findAll()).resolves.toEqual(rows);
    expect(query).toHaveBeenCalledTimes(1);
    expect(normalizeSql(query.mock.calls[0][0])).toBe('SELECT id, name FROM courses ORDER BY id');
    expect(query.mock.calls[0]).toHaveLength(1);
  });

  test('findAll returns an empty list when there are no rows', async () => {
    query.mockResolvedValue({ rows: [] });

    await expect(repo.findAll()).resolves.toEqual([]);
  });

  test('findOne returns the first matching row', async () => {
    const row = { id: 7, name: 'Qualidade' };
    query.mockResolvedValue({ rows: [row] });

    await expect(repo.findOne(7)).resolves.toEqual(row);
    expect(query).toHaveBeenCalledTimes(1);
    expect(normalizeSql(query.mock.calls[0][0])).toBe('SELECT id, name FROM courses WHERE id = $1');
    expect(query.mock.calls[0][1]).toEqual([7]);
  });

  test('findOne returns undefined when no row matches', async () => {
    query.mockResolvedValue({ rows: [] });

    await expect(repo.findOne(7)).resolves.toBeUndefined();
  });

  test('create propagates database errors as the same instance', async () => {
    const error = new Error('db down');
    query.mockRejectedValue(error);

    await expect(repo.create({ name: 'Qualidade' })).rejects.toBe(error);
  });

  test('findAll propagates database errors as the same instance', async () => {
    const error = new Error('db down');
    query.mockRejectedValue(error);

    await expect(repo.findAll()).rejects.toBe(error);
  });

  test('findOne propagates database errors as the same instance', async () => {
    const error = new Error('db down');
    query.mockRejectedValue(error);

    await expect(repo.findOne(7)).rejects.toBe(error);
  });
});
