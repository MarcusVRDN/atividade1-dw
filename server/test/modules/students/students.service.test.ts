import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { StudentsService } from '../../../src/modules/students/students.service';

describe('StudentsService', () => {
  let repository: any;
  let service: StudentsService;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
    };
    service = new StudentsService(repository as any);
  });

  test('create accepts a valid payload and returns the created student', async () => {
    const created = { ra: 123, name: 'Ana' };
    repository.create.mockResolvedValue(created);

    await expect(service.create({ ra: 123, name: 'Ana' })).resolves.toEqual(created);
    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledWith({ ra: 123, name: 'Ana' });
  });

  test('create rejects invalid RA with 400', async () => {
    await expect(service.create({ ra: 0, name: 'Ana' })).rejects.toMatchObject({ statusCode: 400 });
    expect(repository.create).not.toHaveBeenCalled();
  });

  test('create rejects duplicate RA with 409', async () => {
    repository.create.mockRejectedValue({ code: '23505' });

    await expect(service.create({ ra: 123, name: 'Ana' })).rejects.toMatchObject({ statusCode: 409 });
  });

  test('findOne rejects 404 when the student is not found', async () => {
    repository.findOne.mockResolvedValue(undefined);

    await expect(service.findOne(123)).rejects.toMatchObject({ statusCode: 404 });
  });

  test('create propagates unexpected errors as the same instance', async () => {
    const error = new Error('boom');
    repository.create.mockRejectedValue(error);

    await expect(service.create({ ra: 123, name: 'Ana' })).rejects.toBe(error);
  });

  test('findAll returns the repository list', async () => {
    const students = [{ ra: 123, name: 'Ana' }, { ra: 456, name: 'Bruno' }];
    repository.findAll.mockResolvedValue(students);

    await expect(service.findAll()).resolves.toEqual(students);
    expect(repository.findAll).toHaveBeenCalledTimes(1);
    expect(repository.findAll).toHaveBeenCalledWith();
  });

  test('findOne returns the record when it exists', async () => {
    const student = { ra: 123, name: 'Ana' };
    repository.findOne.mockResolvedValue(student);

    await expect(service.findOne(123)).resolves.toEqual(student);
    expect(repository.findOne).toHaveBeenCalledTimes(1);
    expect(repository.findOne).toHaveBeenCalledWith(123);
  });
});
