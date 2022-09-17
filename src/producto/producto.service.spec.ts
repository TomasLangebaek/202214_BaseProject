/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { ProductoEntity } from './producto.entity';
import { ProductoService } from './producto.service';

import { faker } from '@faker-js/faker';
import { TiendaEntity } from "../tienda/tienda.entity";

describe('ProductoService', () => {
  let service: ProductoService;
  let repository: Repository<ProductoEntity>;
  let productosList: ProductoEntity[];
  let dummyTiendas : TiendaEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ProductoService],
    }).compile();

    service = module.get<ProductoService>(ProductoService);
    repository = module.get<Repository<ProductoEntity>>(getRepositoryToken(ProductoEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    await repository.clear();
    productosList = [];
    for (let i = 0; i < 5; i++) {
      const producto: ProductoEntity = await repository.save({
        id: faker.random.alphaNumeric(10),
        nombre: faker.word.noun(),
        precio: faker.seed(),
        tipo: "Perecedero",
        tiendas: dummyTiendas
      });
      productosList.push(producto);
    }
  };

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  it('findAll debe retornar todos los productos', async () => {
    const productos: ProductoEntity[] = await service.findAll();
    expect(productos).not.toBeNull();
    expect(productos).toHaveLength(productosList.length);
  });

  it('findOne debe retornar un producto por id', async () => {
    const storedProducto: ProductoEntity = productosList[0];
    const producto: ProductoEntity = await service.findOne(storedProducto.id);
    expect(producto).not.toBeNull();
    expect(producto.nombre).toEqual(storedProducto.nombre)
    expect(producto.precio).toEqual(storedProducto.precio)
    expect(producto.tipo).toEqual(storedProducto.tipo)
  });

  it('findOne debe lanzar excepción por producto inválido', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty("message", "El producto con el id especificado no existe")
  });

  it('create debe retornar un nuevo producto', async () => {
    const producto: ProductoEntity = {
      id: faker.random.alphaNumeric(10),
      nombre: faker.word.noun(),
      precio: faker.seed(),
      tipo: "Perecedero",
      tiendas: dummyTiendas
    }

    const newProducto: ProductoEntity = await service.create(producto);
    expect(newProducto).not.toBeNull();

    const storedProducto: ProductoEntity = await repository.findOne({where: {id: newProducto.id}})
    expect(storedProducto).not.toBeNull();
    expect(producto.nombre).toEqual(storedProducto.nombre)
    expect(producto.precio).toEqual(storedProducto.precio)
    expect(producto.tipo).toEqual(storedProducto.tipo)
  });

  it('create debe lanzar excepción por tipo invalido', async () => {
    const producto: ProductoEntity = {
      id: faker.random.alphaNumeric(10),
      nombre: faker.word.noun(),
      precio: faker.seed(),
      tipo: "0000000",
      tiendas: dummyTiendas
    }

    await expect(() => service.create(producto)).rejects.toHaveProperty("message", "El tipo de producto debe ser Perecedero o No perecedero")

  });

  it('update debe modificar un producto', async () => {
    const producto: ProductoEntity = productosList[0];
    producto.nombre = "New name";
    producto.precio = 100;

    const updatedProducto: ProductoEntity = await service.update(producto.id, producto);
    expect(updatedProducto).not.toBeNull();

    const storedProducto: ProductoEntity = await repository.findOne({ where: { id: producto.id } })
    expect(storedProducto).not.toBeNull();
    expect(storedProducto.nombre).toEqual(producto.nombre)
    expect(storedProducto.precio).toEqual(producto.precio)
  });

  it('update debe lanzar excepción por producto inválido', async () => {
    let producto: ProductoEntity = productosList[0];
    producto = {
      ...producto, nombre: "New name", precio: 100
    }
    await expect(() => service.update("0", producto)).rejects.toHaveProperty("message", "El producto con el id especificado no existe")
  });

  it('update debe lanzar excepción por tipo inválido', async () => {
    let producto: ProductoEntity = productosList[0];
    producto = {
      ...producto, nombre: "New name", tipo: "000000"
    }
    await expect(() => service.update(producto.id, producto)).rejects.toHaveProperty("message", "El tipo de producto debe ser Perecedero o No perecedero")
  });

  it('delete debe borrar un producto', async () => {
    const producto: ProductoEntity = productosList[0];
    await service.delete(producto.id);

    const deletedProducto: ProductoEntity = await repository.findOne({ where: { id: producto.id } })
    expect(deletedProducto).toBeNull();
  });

  it('delete debe lanzar excepción por producto inválido', async () => {
    const producto: ProductoEntity = productosList[0];
    await service.delete(producto.id);
    await expect(() => service.delete("0")).rejects.toHaveProperty("message", "El producto con el id especificado no existe");
  });
});