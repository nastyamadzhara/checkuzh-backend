import {Entity, ManyToOne, PrimaryGeneratedColumn, Unique} from "typeorm";
import {User} from "../users/user.entity";
import {Place} from "../places/place.entity";

@Entity()
@Unique(['user', 'place']) // одна статуетка — один раз
export class QuestProgress {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE', eager: true })
    user: User;

    @ManyToOne(() => Place, { onDelete: 'CASCADE', eager: true })
    place: Place;
}
