import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { EnrollmentsService } from '../../../src/modules/enrollments/enrollments.service';

describe('EnrollmentsService', () => {
  let repository: any;
  let service: EnrollmentsService;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
    };
    service = new EnrollmentsService(repository as any);
  });

  test('create accepts a valid payload and returns the created enrollment', async () => {
    const created = { studentRa: 123, courseId: 1, enrolledAt: new Date('2024-01-01T00:00:00.000Z') };
    repository.create.mockResolvedValue(created);

    await expect(service.create({ studentRa: 123, courseId: 1 })).resolves.toEqual(created);
    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledWith(123, 1);
  });

  test.each([
    { studentRa: 0, courseId: 1 },
    { studentRa: 123, courseId: 0 },
  ])('create rejects invalid keys %p with 400', async (input) => {
    await expect(service.create(input)).rejects.toMatchObject({ statusCode: 400 });
    expect(repository.create).not.toHaveBeenCalled();
  });

  test('create rejects missing references with 404 when a foreign key is broken', async () => {
    repository.create.mockRejectedValue({ code: '23503' });

    await expect(service.create({ studentRa: 123, courseId: 1 })).rejects.toMatchObject({ statusCode: 404 });
  });

  test('create rejects duplicate enrollments with 409', async () => {
    repository.create.mockRejectedValue({ code: '23505' });

    await expect(service.create({ studentRa: 123, courseId: 1 })).rejects.toMatchObject({ statusCode: 409 });
  });

  test('findOne rejects 404 when the enrollment does not exist', async () => {
    repository.findOne.mockResolvedValue(undefined);

    await expect(service.findOne(123, 1)).rejects.toMatchObject({ statusCode: 404 });
    expect(repository.findOne).toHaveBeenCalledWith(123, 1);
  });

  test('create propagates unexpected errors as the same instance', async () => {
    const error = new Error('boom');
    repository.create.mockRejectedValue(error);

    await expect(service.create({ studentRa: 123, courseId: 1 })).rejects.toBe(error);
  });

  test('findAll returns the repository list', async () => {
    const enrollments = [
      { studentRa: 123, courseId: 1, enrolledAt: new Date('2024-01-01T00:00:00.000Z') },
      { studentRa: 456, courseId: 2, enrolledAt: new Date('2024-01-02T00:00:00.000Z') },
    ];
    repository.findAll.mockResolvedValue(enrollments);

    await expect(service.findAll()).resolves.toEqual(enrollments);
    expect(repository.findAll).toHaveBeenCalledTimes(1);
    expect(repository.findAll).toHaveBeenCalledWith();
  });

  test('findOne returns the record when it exists', async () => {
    const enrollment = { studentRa: 123, courseId: 1, enrolledAt: new Date('2024-01-01T00:00:00.000Z') };
    repository.findOne.mockResolvedValue(enrollment);

    await expect(service.findOne(123, 1)).resolves.toEqual(enrollment);
    expect(repository.findOne).toHaveBeenCalledTimes(1);
    expect(repository.findOne).toHaveBeenCalledWith(123, 1);
  });
});
