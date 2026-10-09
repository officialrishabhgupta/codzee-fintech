import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../auth/user.entity';

@Entity('settlements')
export class Settlement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  batchId: string;

  @Column('decimal', { precision: 14, scale: 2 })
  totalAmount: number;

  @Column({ default: 'INR' })
  currency: string;

  @Column({ default: 'pending' })
  status: string;

  @Column()
  bankAccount: string;

  @Column({ nullable: true })
  bankReference: string;

  @Column({ default: 0 })
  transactionCount: number;

  @Column('json', { nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;
}
