import { Schema, model, Document } from 'mongoose';

export enum RoleType {
  Employee = 'employee',
  Employer = 'employer',
  Admin = 'admin',
}

export interface IRole extends Document {
  name: RoleType;
}

const roleSchema = new Schema<IRole>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    enum: Object.values(RoleType),
  },
});

export const Role = model<IRole>('Role', roleSchema);