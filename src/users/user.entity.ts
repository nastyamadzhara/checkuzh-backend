import {Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany} from 'typeorm';
import {UserType} from "./dto/update-profile.dto";
import {Place} from "../places/place.entity";
import {QuestProgress} from "../quest/quest-progress.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    nickname: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    firstName: string;

    @Column({ nullable: true })
    email: string;

    @Column({
        type: 'enum',
        enum: UserType,
        nullable: true,
    })
    userType: UserType;

    @Column({ nullable: true, type: 'text' })
    bio: string;

    @Column({ nullable: true })
    avatarUrl: string;

    @Column({ default: 0 })
    likedCount: number;

    @OneToMany(() => QuestProgress, qp => qp.user)
    questProgress: QuestProgress[];

    @ManyToMany(() => Place, place => place.favoritedBy)
    @JoinTable()
    favorites: Place[];
}
