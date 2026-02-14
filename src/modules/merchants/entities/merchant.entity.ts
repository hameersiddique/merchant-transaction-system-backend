import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Transaction } from '../../transactions/entities/transaction.entity';

@Entity('merchants')
@Index('idx_merchant_name', ['name']) // for name based searches
@Index('idx_merchant_refresh_token', ['refreshToken']) // for token validation
@Index('idx_merchant_created_at', ['createdAt']) // for date sorting/filtering
export class Merchant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'refresh_token' })
  refreshToken?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => Transaction, transaction => transaction.merchant)
  transactions!: Transaction[];
}