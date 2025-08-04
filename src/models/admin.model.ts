import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { RoleType } from './role.model';

export interface IAdmin extends Document {
  email: string;
  password: string;
  role: RoleType;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AdminSchema: Schema<IAdmin> = new Schema(
  {
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true,
      trim: true 
    },
    password: { 
      type: String, 
      required: true, 
      minlength: 6 
    },
    role: {
      type: String,
      enum: Object.values(RoleType),
      default: RoleType.Admin,
      required: true
    }
  },
  { timestamps: true }
);

// Hash password before saving
AdminSchema.pre('save', async function(this: IAdmin, next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    const err = error as Error;
    next(err);
  }
});

// Compare password method
AdminSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Ensure password is not returned in JSON
AdminSchema.set('toJSON', {
  transform: function(doc, ret: any) {
    const { password, __v, ...rest } = ret;
    return rest;
  }
});

// Index for better performance
AdminSchema.index({ email: 1 });

export default mongoose.model<IAdmin>('Admin', AdminSchema);