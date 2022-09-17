/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { BusinessErrorsInterceptor } from "../shared/interceptors/business-errors.interceptor";
import { ProductoTiendaService } from "./producto-tienda.service";
import { plainToInstance } from "class-transformer";
import { TiendaDto } from "../tienda/tienda.dto";
import { TiendaEntity } from "../tienda/tienda.entity";

@UseInterceptors(BusinessErrorsInterceptor)
@Controller('products')
export class ProductoTiendaController {
  constructor(private readonly productoTiendaService: ProductoTiendaService){}
  
  @Post(':productoId/stores/:storeId')
  async addStoreToProducto(@Param('productoId') productoId: string, @Param('storeId') storeId: string){
    return await this.productoTiendaService.addStoreToProducto(productoId, storeId);
  }
  
  @Get(':productoId/stores/:storeId')
  async findStoreFromProduct(@Param('storeId') storeId: string){
    return await this.productoTiendaService.findStoreFromProduct(storeId);
  }
  
  @Get(':productoId/stores/storeId')
  async findStoresFromProduct(@Param('productoId') productoId: string, @Param('storeId') storeId: string){
    return await this.productoTiendaService.findStoresFromProduct(productoId, storeId);
  }
  
  @Put(':productoId/stores')
  async updateStoresFromProduct(@Body() storesDto: TiendaDto[], @Param('productoId') productoId: string){
    const stores = plainToInstance(TiendaEntity, storesDto)
    return await this.productoTiendaService.updateStoresFromProduct(productoId, stores);
  }
  
  @Delete(':productoId/stores/:storeId')
  @HttpCode(204)
  async deleteStoresFromProduct(@Param('productoId') productoId: string, @Param('storeId') storeId: string){
    return await this.productoTiendaService.deleteStoreFromProduct(productoId, storeId);
  }
}
