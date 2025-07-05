import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';
import { User } from 'src/users/user.entity';
import { Place } from 'src/places/place.entity';

@Entity()
@Unique(['user', 'place'])
export class PlaceRating {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { eager: true })
    user: User;

    @ManyToOne(() => Place, { eager: true })
    place: Place;

    @Column({ type: 'int' })
    rating: number; 
}