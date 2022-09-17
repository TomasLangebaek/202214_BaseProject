/* eslint-disable prettier/prettier */
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { TiendaEntity } from "../tienda/tienda.entity";

@Entity()
export class ProductoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  precio: string;

  @Column()
  tipo: string;

  @ManyToMany(() => TiendaEntity, tienda => tienda.productos)
  tiendas: TiendaEntity[];
}
