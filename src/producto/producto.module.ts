/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ProductoService } from './producto.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductoEntity } from "./producto.entity";

@Module({
  providers: [ProductoService],
  imports: [TypeOrmModule.forFeature([ProductoEntity])],
})
export class ProductoModule {}
