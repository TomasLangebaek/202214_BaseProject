/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { ProductoEntity } from "./producto.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { BusinessError, BusinessLogicException } from "../shared/errors/business-errors";

@Injectable()
export class ProductoService {
  constructor(
    @InjectRepository(ProductoEntity)
    private readonly productoRepository: Repository<ProductoEntity>
  ){}

  async findAll(): Promise<ProductoEntity[]> {
    return await this.productoRepository.find({ relations: ["tiendas"] });
  }

  async findOne(id: string): Promise<ProductoEntity> {
    const producto: ProductoEntity = await this.productoRepository.findOne({where: {id}, relations: ["tiendas"] } );
    if (!producto)
      throw new BusinessLogicException("El producto con el id especificado no existe", BusinessError.NOT_FOUND);

    return producto;
  }

  async create(producto: ProductoEntity): Promise<ProductoEntity> {
    if(producto.tipo != "Perecedero" && (producto.tipo != "No perecedero"))
      throw new BusinessLogicException("El tipo de producto debe ser Perecedero o No perecedero", BusinessError.PRECONDITION_FAILED);

    return await this.productoRepository.save(producto);
  }

  async update(id: string, producto: ProductoEntity): Promise<ProductoEntity> {
    const persistedProducto: ProductoEntity = await this.productoRepository.findOne({where:{id}});
    if (!persistedProducto)
      throw new BusinessLogicException("El producto con el id especificado no existe", BusinessError.NOT_FOUND);

    if(producto.tipo != "Perecedero" && (producto.tipo != "No perecedero"))
      throw new BusinessLogicException("El tipo de producto debe ser Perecedero o No perecedero", BusinessError.PRECONDITION_FAILED);

    return await this.productoRepository.save({...persistedProducto, ...producto});
  }

  async delete(id: string) {
    const producto: ProductoEntity = await this.productoRepository.findOne({where:{id}});
    if (!producto)
      throw new BusinessLogicException("El producto con el id especificado no existe", BusinessError.NOT_FOUND);

    await this.productoRepository.remove(producto);
  }
}
