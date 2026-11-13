import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { HttpError } from '../../../src/errors';
import { CoursesService } from '../../../src/modules/courses/courses.service';

function createRepository() {
  return {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  };
}

describe('CoursesService', () => {
  let repository: any;
  let service: CoursesService;

  beforeEach(() => {
    repository = createRepository();
    service = new CoursesService(repository as any);
  });

  test('create accepts a valid payload and returns the created course', async () => {
    const created = { id: 1, name: 'Qualidade' };
    repository.create.mockResolvedValue(created);

    await expect(service.create({ name: 'Qualidade' })).resolves.toEqual(created);
    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledWith({ name: 'Qualidade' });
  });

  test.each([null, {}, { name: 'A' }])('create rejects invalid payload %p with 400', async (input) => {
    await expect(service.create(input as never)).rejects.toMatchObject({ statusCode: 400 });
    expect(repository.create).not.toHaveBeenCalled();
  });

  test('create rejects duplicate names with 409', async () => {
    repository.create.mockRejectedValue({ code: '23505' });

    await expect(service.create({ name: 'Qualidade' })).rejects.toMatchObject({ statusCode: 409 });
  });

  test('findAll returns the repository data', async () => {
    const data = [{ id: 1, name: 'Qualidade' }, { id: 2, name: 'Banco de dados' }];
    repository.findAll.mockResolvedValue(data);

    await expect(service.findAll()).resolves.toEqual(data);
    expect(repository.findAll).toHaveBeenCalledTimes(1);
    expect(repository.findAll).toHaveBeenCalledWith();
  });

  test('findOne returns the record when it exists', async () => {
    const record = { id: 123, name: 'Qualidade' };
    repository.findOne.mockResolvedValue(record);

    await expect(service.findOne(123)).resolves.toEqual(record);
    expect(repository.findOne).toHaveBeenCalledTimes(1);
    expect(repository.findOne).toHaveBeenCalledWith(123);
  });

  test('findOne rejects with 404 when the course does not exist', async () => {
    repository.findOne.mockResolvedValue(undefined);

    await expect(service.findOne(123)).rejects.toMatchObject({ statusCode: 404 });
  });

  test('findOne rejects invalid identifiers with 400', async () => {
    await expect(service.findOne(0)).rejects.toMatchObject({ statusCode: 400 });
    expect(repository.findOne).not.toHaveBeenCalled();
  });

  test('create propagates unexpected errors as the same instance', async () => {
    const error = new Error('boom');
    repository.create.mockRejectedValue(error);

    await expect(service.create({ name: 'Qualidade' })).rejects.toBe(error);
  });

  test('findAll propagates unexpected errors as the same instance', async () => {
    const error = new Error('boom');
    repository.findAll.mockRejectedValue(error);

    await expect(service.findAll()).rejects.toBe(error);
  });

  test('findOne propagates unexpected errors as the same instance', async () => {
    const error = new Error('boom');
    repository.findOne.mockResolvedValue({ id: 1, name: 'Qualidade' });
    const spy = jest.spyOn(repository, 'findOne').mockRejectedValue(error);

    await expect(service.findOne(1)).rejects.toBe(error);
    expect(spy).toHaveBeenCalledWith(1);
  });

  test('findOne can be observed via a spy on the repository method', async () => {
    const record = { id: 1, name: 'Qualidade' };
    const spy = jest.spyOn(repository, 'findOne').mockResolvedValue(record);

    await expect(service.findOne(1)).resolves.toEqual(record);
    expect(spy).toHaveBeenCalledWith(1);
  });

  test('create strips extra fields before calling the repository', async () => {
    repository.create.mockResolvedValue({ id: 1, name: 'Qualidade' });

    await service.create({ name: 'Qualidade', extra: true } as unknown as Record<string, unknown>);
    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledWith({ name: 'Qualidade' });
  });
});
