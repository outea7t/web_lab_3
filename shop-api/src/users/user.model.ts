import { Table, Model, Column, DataType } from 'sequelize-typescript';

export type UserRole = 'admin' | 'user';
export type UserGender = 'male' | 'female' | 'na';

export interface UserCreationAttrs {
  email: string;
  password: string;   // уже захэшированный
  role?: UserRole;

  firstName: string;
  lastName: string;
  gender?: UserGender;
  city?: string | null;
  about?: string | null;
  marketing?: boolean;
  notify?: boolean;
}

@Table({ tableName: 'users' })
export class User extends Model<User, UserCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare password: string; // захэшированный пароль

  @Column({
    type: DataType.ENUM('admin', 'user'),
    allowNull: false,
    defaultValue: 'user',
  })
  declare role: UserRole;

  @Column({
    field: 'first_name',
    type: DataType.STRING,
    allowNull: false,
  })
  declare firstName: string;

  @Column({
    field: 'last_name',
    type: DataType.STRING,
    allowNull: false,
  })
  declare lastName: string;

  @Column({
    type: DataType.ENUM('male', 'female', 'na'),
    allowNull: false,
    defaultValue: 'na',
  })
  declare gender: UserGender;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare city: string | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare about: string | null;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare marketing: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare notify: boolean;
}
