/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { TiendaService } from "./tienda.service";
import { TiendaEntity } from "./tienda.entity";
import { faker } from "@faker-js/faker";
import { ProductoEntity } from "../producto/producto.entity";

describe('TiendaService', () => {
  let service: TiendaService;
  let repository: Repository<TiendaEntity>;
  let tiendasList: TiendaEntity[];
  let dummyProductos : ProductoEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [TiendaService],
    }).compile();

    service = module.get<TiendaService>(TiendaService);
    repository = module.get<Repository<TiendaEntity>>(getRepositoryToken(TiendaEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    await repository.clear();
    tiendasList = [];
    for (let i = 0; i < 5; i++) {
      const tienda: TiendaEntity = await repository.save({
        id: faker.random.alphaNumeric(10),
        nombre: faker.word.noun(),
        ciudad: "BOG",
        direccion: faker.address.streetAddress(),
        productos: dummyProductos
      });
      tiendasList.push(tienda);
    }
  };

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  it('findAll debe retornar todos los tiendas', async () => {
    const tiendas: TiendaEntity[] = await service.findAll();
    expect(tiendas).not.toBeNull();
    expect(tiendas).toHaveLength(tiendasList.length);
  });

  it('findOne debe retornar un tienda por id', async () => {
    const storedTienda: TiendaEntity = tiendasList[0];
    const tienda: TiendaEntity = await service.findOne(storedTienda.id);
    expect(tienda).not.toBeNull();
    expect(tienda.nombre).toEqual(storedTienda.nombre)
    expect(tienda.ciudad).toEqual(storedTienda.ciudad)
    expect(tienda.direccion).toEqual(storedTienda.direccion)
  });

  it('findOne debe lanzar excepción por tienda inválido', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty("message", "La tienda con el id especificado no existe")
  });

  it('create debe retornar una nueva tienda', async () => {
    const tienda: TiendaEntity = {
      id: faker.random.alphaNumeric(10),
      nombre: faker.word.noun(),
      ciudad: "BOG",
      direccion: faker.address.streetAddress(),
      productos: dummyProductos
    }

    const newTienda: TiendaEntity = await service.create(tienda);
    expect(newTienda).not.toBeNull();

    const storedTienda: TiendaEntity = await repository.findOne({where: {id: newTienda.id}})
    expect(storedTienda).not.toBeNull();
    expect(tienda.nombre).toEqual(storedTienda.nombre)
    expect(tienda.ciudad).toEqual(storedTienda.ciudad)
    expect(tienda.direccion).toEqual(storedTienda.direccion)
  });

  it('create debe lanzar excepción por tipo invalido', async () => {
    const tienda: TiendaEntity = {
      id: faker.random.alphaNumeric(10),
      nombre: faker.word.noun(),
      ciudad: "Hu6t&YU/",
      direccion: faker.address.streetAddress(),
      productos: dummyProductos
    }

    await expect(() => service.create(tienda)).rejects.toHaveProperty("message", "La ciudad debe ser un codigo de tres letras mayúsculas")

  });

  it('update debe modificar un tienda', async () => {
    const tienda: TiendaEntity = tiendasList[0];
    tienda.nombre = "New name";
    tienda.ciudad = "CTG";

    const updatedTienda: TiendaEntity = await service.update(tienda.id, tienda);
    expect(updatedTienda).not.toBeNull();

    const storedTienda: TiendaEntity = await repository.findOne({ where: { id: tienda.id } })
    expect(storedTienda).not.toBeNull();
    expect(storedTienda.nombre).toEqual(tienda.nombre)
    expect(storedTienda.ciudad).toEqual(tienda.ciudad)
  });

  it('update debe lanzar excepción por ciudad inválida', async () => {
    let tienda: TiendaEntity = tiendasList[0];
    tienda = {
      ...tienda, nombre: "New name", ciudad: "CTG"
    }
    await expect(() => service.update("0", tienda)).rejects.toHaveProperty("message", "La tienda con el id especificado no existe")
  });

  it('update debe lanzar excepción por tipo inválido', async () => {
    let tienda: TiendaEntity = tiendasList[0];
    tienda = {
      ...tienda, nombre: "New name", ciudad: "8H7UUa9"
    }
    await expect(() => service.update(tienda.id, tienda)).rejects.toHaveProperty("message", "La ciudad debe ser un codigo de tres letras mayúsculas")
  });

  it('delete debe borrar una tienda', async () => {
    const tienda: TiendaEntity = tiendasList[0];
    await service.delete(tienda.id);

    const deletedTienda: TiendaEntity = await repository.findOne({ where: { id: tienda.id } })
    expect(deletedTienda).toBeNull();
  });

  it('delete debe lanzar excepción por tienda inválido', async () => {
    const tienda: TiendaEntity = tiendasList[0];
    await service.delete(tienda.id);
    await expect(() => service.delete("0")).rejects.toHaveProperty("message", "La tienda con el id especificado no existe");
  });

});