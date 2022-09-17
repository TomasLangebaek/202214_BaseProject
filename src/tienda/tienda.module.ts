/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TiendaService } from './tienda.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { TiendaEntity } from "./tienda.entity";

@Module({
  providers: [TiendaService],
  imports: [TypeOrmModule.forFeature([TiendaEntity])],
})
export class TiendaModule {}
