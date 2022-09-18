/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { TiendaEntity } from '../tienda/tienda.entity';
import { Repository } from 'typeorm';
import { ProductoEntity } from '../producto/producto.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { ProductoTiendaService } from './producto-tienda.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';

describe('ProductoTiendaService', () => {
  let service: ProductoTiendaService;
  let productoRepository: Repository<ProductoEntity>;
  let tiendaRepository: Repository<TiendaEntity>;
  let producto: ProductoEntity;
  let tiendasList : TiendaEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ProductoTiendaService],
    }).compile();

    service = module.get<ProductoTiendaService>(ProductoTiendaService);
    productoRepository = module.get<Repository<ProductoEntity>>(getRepositoryToken(ProductoEntity));
    tiendaRepository = module.get<Repository<TiendaEntity>>(getRepositoryToken(TiendaEntity));

    await seedDatabase();
  });

  const seedDatabase = async () => {
    await tiendaRepository.clear();
    await productoRepository.clear();

    tiendasList = [];
    for(let i = 0; i < 5; i++){
      const tienda: TiendaEntity = await tiendaRepository.save({
        nombre: faker.word.noun(),
        ciudad: "BOG",
        direccion: faker.address.streetAddress(),
      })
      tiendasList.push(tienda);
    }

    producto = await productoRepository.save({
      nombre: faker.word.noun(),
      precio: faker.seed(),
      tipo: "Perecedero",
      tiendas: tiendasList
    })
  }

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  it('addStoreToProducto debe asociar una tienda a un producto', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.word.noun(),
      ciudad: "BOG",
      direccion: faker.address.streetAddress(),
    });

    const newProducto: ProductoEntity = await productoRepository.save({
      nombre: faker.word.noun(),
      precio: faker.seed(),
      tipo: "Perecedero",
    })

    const result: ProductoEntity = await service.addStoreToProducto(newProducto.id, newTienda.id);

    expect(result.tiendas.length).toBe(1);
    expect(result.tiendas[0]).not.toBeNull();
    expect(result.tiendas[0].nombre).toBe(newTienda.nombre)
    expect(result.tiendas[0].ciudad).toBe(newTienda.ciudad)
    expect(result.tiendas[0].direccion).toBe(newTienda.direccion)
  });

  it('addStoreToProducto debe lanzar excepción por tienda inválida', async () => {
    const newProducto: ProductoEntity = await productoRepository.save({
      nombre: faker.word.noun(),
      precio: faker.seed(),
      tipo: "Perecedero",
    })

    await expect(() => service.addStoreToProducto(newProducto.id, "0")).rejects.toHaveProperty("message", "La tienda con el id especificado no existe");
  });

  it('addStoreToProducto debe lanzar excepción por producto inválido', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.word.noun(),
      ciudad: "BOG",
      direccion: faker.address.streetAddress(),
    });

    await expect(() => service.addStoreToProducto("0", newTienda.id)).rejects.toHaveProperty("message", "El producto con el id especificado no existe");
  });

  it('findStoreFromProduct debe retornar una tienda de un producto', async () => {
    const tienda: TiendaEntity = tiendasList[0];
    const storedTienda: TiendaEntity = await service.findStoreFromProduct(producto.id, tienda.id, )
    expect(storedTienda).not.toBeNull();
    expect(storedTienda.nombre).toBe(tienda.nombre);
    expect(storedTienda.ciudad).toBe(tienda.ciudad);
    expect(storedTienda.direccion).toBe(tienda.direccion);
  });

  it('findStoreFromProduct debe lanzar excepción por tienda inválida', async () => {
    await expect(()=> service.findStoreFromProduct(producto.id, "0")).rejects.toHaveProperty("message", "La tienda con el id especificado no existe");
  });

  it('findStoreFromProduct debe lanzar excepción por producto inválido', async () => {
    const tienda: TiendaEntity = tiendasList[0];
    await expect(()=> service.findStoreFromProduct("0", tienda.id)).rejects.toHaveProperty("message", "El producto con el id especificado no existe");
  });

  it('findStoreFromProduct debe lanzar excepción por una tienda no asociada al producto', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.word.noun(),
      ciudad: "BOG",
      direccion: faker.address.streetAddress(),
    });

    await expect(()=> service.findStoreFromProduct(producto.id, newTienda.id)).rejects.toHaveProperty("message", "La tienda con el id especificado no está asociada al producto");
  });

  it('findStoresFromProduct debe retornar las tiendas por producto', async ()=>{
    const tiendas: TiendaEntity[] = await service.findStoresFromProduct(producto.id);
    expect(tiendas.length).toBe(5)
  });

  it('findStoresFromProduct debe lanzar excepción por producto inválido', async () => {
    await expect(()=> service.findStoresFromProduct("0")).rejects.toHaveProperty("message", "El producto con el id especificado no existe");
  });

  it('updateStoresFromProduct debe actualizar las tiendas de un producto', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.word.noun(),
      ciudad: "BOG",
      direccion: faker.address.streetAddress(),
    });

    const updatedProducto: ProductoEntity = await service.updateStoresFromProduct(producto.id, [newTienda]);
    expect(updatedProducto.tiendas.length).toBe(1);

    expect(updatedProducto.tiendas[0].nombre).toBe(newTienda.nombre);
    expect(updatedProducto.tiendas[0].ciudad).toBe(newTienda.ciudad);
    expect(updatedProducto.tiendas[0].direccion).toBe(newTienda.direccion);
  });

  it('updateStoresFromProduct debe lanzar excepción por producto inválido', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.word.noun(),
      ciudad: "BOG",
      direccion: faker.address.streetAddress(),
    });

    await expect(()=> service.updateStoresFromProduct("0", [newTienda])).rejects.toHaveProperty("message", "El producto con el id especificado no existe");
  });

  it('updateStoresFromProduct debe lanzar excepción por an invalid tienda', async () => {
    const newTienda: TiendaEntity = tiendasList[0];
    newTienda.id = "0";

    await expect(()=> service.updateStoresFromProduct(producto.id, [newTienda])).rejects.toHaveProperty("message", "La tienda con el id especificado no existe");
  });

  it('deleteStoreFromProduct debe eliminar una tienda de un producto', async () => {
    const tienda: TiendaEntity = tiendasList[0];

    await service.deleteStoreFromProduct(producto.id, tienda.id);

    const storedProducto: ProductoEntity = await productoRepository.findOne({where: {id: producto.id}, relations: ["tiendas"]});
    const deletedTienda: TiendaEntity = storedProducto.tiendas.find(a => a.id === tienda.id);

    expect(deletedTienda).toBeUndefined();

  });

  it('deleteStoreFromProduct debe lanzar excepción por una tienda inválida', async () => {
    await expect(()=> service.deleteStoreFromProduct(producto.id, "0")).rejects.toHaveProperty("message", "La tienda con el id especificado no existe");
  });

  it('deleteStoreFromProduct debe lanzar excepción por un producto inválido', async () => {
    const tienda: TiendaEntity = tiendasList[0];
    await expect(()=> service.deleteStoreFromProduct("0", tienda.id)).rejects.toHaveProperty("message", "El producto con el id especificado no existe");
  });

  it('deleteStoreFromProduct debe lanzar excepción por una tienda no asociada al producto', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.word.noun(),
      ciudad: "BOG",
      direccion: faker.address.streetAddress(),
    });

    await expect(()=> service.deleteStoreFromProduct(producto.id, newTienda.id)).rejects.toHaveProperty("message", "La tienda con el id especificado no está asociada al producto");
  });

});