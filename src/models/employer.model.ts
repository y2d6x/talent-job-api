import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { RoleType } from './role.model'; // استيراد RoleType

export interface IEmployer extends Document {
  companyName: string;
  email: string;
  password: string;
  role: RoleType; // <--- إضافة: تعريف الحقل في الواجهة
  phoneNumber: string;
  details: {
    industry: string;
    contactName: string;
    contactPosition: string;
  };
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const EmployerSchema: Schema<IEmployer> = new Schema(
  {
    companyName: { 
      type: String, 
      required: true, 
      trim: true 
    },
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
    role: { // <--- إضافة: تعريف الحقل في المخطط
      type: String,
      enum: Object.values(RoleType),
      default: RoleType.Employer,
      required: true
    },
    phoneNumber: { 
      type: String, 
      required: true, 
      trim: true 
    },
    details: {
      industry: { 
        type: String, 
        required: true, 
        trim: true 
      },
      contactName: { 
        type: String, 
        required: true, 
        trim: true 
      },
      contactPosition: { 
        type: String, 
        required: true, 
        trim: true 
      },
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    lastLogin: {
      type: Date
    }
  },
  { timestamps: true }
);

// Hash password before saving
EmployerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
EmployerSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Ensure password is not returned in JSON
EmployerSchema.set('toJSON', {
  transform: function(doc, ret: any) {
    const { password, ...rest } = ret;
    return rest;
  }
});

// Indexes for better performance
EmployerSchema.index({ email: 1 });
EmployerSchema.index({ companyName: 'text' });
EmployerSchema.index({ isActive: 1 });

export default mongoose.model<IEmployer>('Employer', EmployerSchema);
