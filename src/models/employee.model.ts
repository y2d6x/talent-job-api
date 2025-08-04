import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { RoleType } from './role.model';

export interface IEmployee extends Document {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string; // Ensure this is hashed before saving
  role: RoleType;
  gender: 'male' | 'female' | 'other';
  age: number;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;

  jobInfo: {
    jobTitle: string;
    skills: string[];
    experienceDescription: string;
    experienceLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'other';
    yearsOfExperience: number;
    educationalStatus: string;
    lastWork?: string;
  };
}

const EmployeeSchema: Schema<IEmployee> = new Schema(
  {
    username: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true 
    },
    firstName: { 
      type: String, 
      required: true, 
      trim: true 
    },
    lastName: { 
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
    role: {
      type: String,
      enum: Object.values(RoleType),
      default: RoleType.Employee,
      required: true
    },
    gender: { 
      type: String, 
      enum: ['male', 'female', 'other'], 
      required: true 
    },
    age: { 
      type: Number, 
      required: true,
      min: 16,
      max: 100
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
    },

    jobInfo: {
      jobTitle: { 
        type: String, 
        required: true, 
        trim: true 
      },
      skills: [{ 
        type: String, 
        required: true, 
        trim: true 
      }],
      experienceDescription: { 
        type: String, 
        required: true, 
        trim: true 
      },
      experienceLevel: {
        type: String,
        enum: ['entry', 'mid', 'senior', 'lead', 'other'],
        required: true,
      },
      yearsOfExperience: { 
        type: Number, 
        required: true,
        min: 0,
        max: 50
      },
      educationalStatus: { 
        type: String, 
        required: true, 
        trim: true 
      },
      lastWork: { 
        type: String, 
        trim: true 
      },
    },
  },
  { timestamps: true }
);

// Hash password before saving
EmployeeSchema.pre('save', async function(next) {
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
EmployeeSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full name
EmployeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
EmployeeSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret: any) {
    const { password, ...rest } = ret;
    return rest;
  }
});

// Indexes for better performance
EmployeeSchema.index({ email: 1 });
EmployeeSchema.index({ username: 1 });
EmployeeSchema.index({ 'jobInfo.jobTitle': 'text', 'jobInfo.skills': 'text' });
EmployeeSchema.index({ isActive: 1 });
EmployeeSchema.index({ 'jobInfo.experienceLevel': 1 });

export default mongoose.model<IEmployee>('Employee', EmployeeSchema);
