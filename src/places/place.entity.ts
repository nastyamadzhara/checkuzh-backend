import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToMany,
    JoinTable, Index,
} from 'typeorm';
import { User } from 'src/users/user.entity';

@Entity()

@Index(['name', 'latitude', 'longitude'], { unique: true })

export class Place {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column('text')
    description: string;

    @Column({ nullable: true })
    address: string;

    @Column('decimal', { precision: 9, scale: 6 })
    latitude: number;

    @Column('decimal', { precision: 9, scale: 6 })
    longitude: number;

    @Column({ default: 0 })
    rating: number;

    @Column({ default: 0 })
    likes: number;

    @ManyToMany(() => User, user => user.favorites, { cascade: true })
    favoritedBy: User[];

    @Column()
    category: string;

    @Column('text', { nullable: true })
    imageUrl: string | null;

}
