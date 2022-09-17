/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TiendaEntity } from "./tienda.entity";

import { BusinessError, BusinessLogicException } from "../shared/errors/business-errors";

@Injectable()
export class TiendaService {
  constructor(
    @InjectRepository(TiendaEntity)
    private readonly tiendaRepository: Repository<TiendaEntity>
  ){}

  async findAll(): Promise<TiendaEntity[]> {
    return await this.tiendaRepository.find({ relations: ["productos"] });
  }

  async findOne(id: string): Promise<TiendaEntity> {
    const tienda: TiendaEntity = await this.tiendaRepository.findOne({where: {id}, relations: ["productos"] } );
    if (!tienda)
      throw new BusinessLogicException("La tienda con el id especificado no existe", BusinessError.NOT_FOUND);

    return tienda;
  }

  async create(tienda: TiendaEntity): Promise<TiendaEntity> {
    const RegEx = /^[A-Z]+$/i;
    const Valid = RegEx.test(tienda.ciudad);
    if(tienda.ciudad.length != 3 || !Valid)
      throw new BusinessLogicException("La ciudad debe ser un codigo de tres letras mayúsculas", BusinessError.PRECONDITION_FAILED);

    return await this.tiendaRepository.save(tienda);
  }

  async update(id: string, tienda: TiendaEntity): Promise<TiendaEntity> {
    const persistedTienda: TiendaEntity = await this.tiendaRepository.findOne({where:{id}});
    if (!persistedTienda)
      throw new BusinessLogicException("La tienda con el id especificado no existe", BusinessError.NOT_FOUND);

    const RegEx = /^[A-Z]+$/i;
    const Valid = RegEx.test(tienda.ciudad);
    if(tienda.ciudad.length != 3 || !Valid)
      throw new BusinessLogicException("La ciudad debe ser un codigo de tres letras mayúsculas", BusinessError.PRECONDITION_FAILED);

    return await this.tiendaRepository.save({...persistedTienda, ...tienda});
  }

  async delete(id: string) {
    const tienda: TiendaEntity = await this.tiendaRepository.findOne({where:{id}});
    if (!tienda)
      throw new BusinessLogicException("La tienda con el id especificado no existe", BusinessError.NOT_FOUND);

    await this.tiendaRepository.remove(tienda);
  }
}
