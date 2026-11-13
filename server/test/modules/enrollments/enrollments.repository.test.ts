import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { PgEnrollmentRepository } from '../../../src/modules/enrollments/enrollments.repository';

function normalizeSql(sql: string) {
  return sql.replace(/\s+/g, ' ').trim();
}

describe('PgEnrollmentRepository', () => {
  let query: any;
  let repo: PgEnrollmentRepository;

  beforeEach(() => {
    query = jest.fn();
    repo = new PgEnrollmentRepository({ query } as any);
  });

  test('create inserts the enrollment and returns the created row', async () => {
    const created = {
      studentRa: 123,
      courseId: 7,
      enrolledAt: new Date('2024-01-01T00:00:00.000Z'),
    };
    query.mockResolvedValue({ rows: [created] });

    await expect(repo.create(123, 7)).resolves.toEqual(created);
    expect(query).toHaveBeenCalledTimes(1);
    expect(normalizeSql(query.mock.calls[0][0])).toBe(
      'INSERT INTO enrollments (student_ra, course_id) VALUES ($1, $2) RETURNING student_ra AS "studentRa", course_id AS "courseId", enrolled_at AS "enrolledAt"',
    );
    expect(query.mock.calls[0][1]).toEqual([123, 7]);
  });

  test('findAll returns the rows in order', async () => {
    const rows = [
      { studentRa: 123, courseId: 7, enrolledAt: new Date('2024-01-01T00:00:00.000Z') },
      { studentRa: 456, courseId: 8, enrolledAt: new Date('2024-01-02T00:00:00.000Z') },
    ];
    query.mockResolvedValue({ rows });

    await expect(repo.findAll()).resolves.toEqual(rows);
    expect(query).toHaveBeenCalledTimes(1);
    expect(normalizeSql(query.mock.calls[0][0])).toBe(
      'SELECT student_ra AS "studentRa", course_id AS "courseId", enrolled_at AS "enrolledAt" FROM enrollments ORDER BY student_ra, course_id',
    );
    expect(query.mock.calls[0]).toHaveLength(1);
  });

  test('findAll returns an empty list when there are no rows', async () => {
    query.mockResolvedValue({ rows: [] });

    await expect(repo.findAll()).resolves.toEqual([]);
  });

  test('findOne returns the first matching row', async () => {
    const row = { studentRa: 123, courseId: 7, enrolledAt: new Date('2024-01-01T00:00:00.000Z') };
    query.mockResolvedValue({ rows: [row] });

    await expect(repo.findOne(123, 7)).resolves.toEqual(row);
    expect(query).toHaveBeenCalledTimes(1);
    expect(normalizeSql(query.mock.calls[0][0])).toBe(
      'SELECT student_ra AS "studentRa", course_id AS "courseId", enrolled_at AS "enrolledAt" FROM enrollments WHERE student_ra = $1 AND course_id = $2',
    );
    expect(query.mock.calls[0][1]).toEqual([123, 7]);
  });

  test('findOne returns undefined when no row matches', async () => {
    query.mockResolvedValue({ rows: [] });

    await expect(repo.findOne(123, 7)).resolves.toBeUndefined();
  });

  test('create propagates database errors as the same instance', async () => {
    const error = new Error('db down');
    query.mockRejectedValue(error);

    await expect(repo.create(123, 7)).rejects.toBe(error);
  });

  test('findAll propagates database errors as the same instance', async () => {
    const error = new Error('db down');
    query.mockRejectedValue(error);

    await expect(repo.findAll()).rejects.toBe(error);
  });

  test('findOne propagates database errors as the same instance', async () => {
    const error = new Error('db down');
    query.mockRejectedValue(error);

    await expect(repo.findOne(123, 7)).rejects.toBe(error);
  });
});
