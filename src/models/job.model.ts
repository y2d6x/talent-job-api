import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IJob extends Document {
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string;
  type: 'Internship' | 'Part Time' | 'Hybrid' | 'Full time' | 'Freelance';
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  experience: 'Entry' | 'Mid' | 'Senior';
  education: 'HighSchool' | 'Bachelor' | 'Bachelor Student' | 'Master' | 'Other';
  skills: string[];
  status: 'Active' | 'Inactive';
  hoursOfWork: string;
  employer: Types.ObjectId;
  location?: string;
  isRemote: boolean;
  applicationsCount: number;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema: Schema<IJob> = new Schema(
  {
    title: { 
      type: String, 
      required: true, 
      trim: true 
    },
    description: { 
      type: String, 
      required: true, 
      trim: true 
    },
    requirements: [{ 
      type: String, 
      required: true, 
      trim: true 
    }],
    responsibilities: { 
      type: String, 
      required: true, 
      trim: true 
    },
    type: {
      type: String,
      enum: ['Internship', 'Part Time', 'Hybrid', 'Full time', 'Freelance'],
      required: true,
    },
    salary: {
      min: { 
        type: Number, 
        required: true,
        min: 0
      },
      max: { 
        type: Number, 
        required: true,
        min: 0
      },
      currency: { 
        type: String, 
        required: true,
        default: 'USD'
      },
    },
    experience: {
      type: String,
      enum: ['Entry', 'Mid', 'Senior'],
      required: true,
    },
    education: {
      type: String,
      enum: ['HighSchool', 'Bachelor', 'Bachelor Student', 'Master', 'Other'],
      required: true,
    },
    skills: [{ 
      type: String, 
      required: true, 
      trim: true 
    }],
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    hoursOfWork: { 
      type: String, 
      required: true, 
      trim: true 
    },
    location: {
      type: String,
      trim: true
    },
    isRemote: {
      type: Boolean,
      default: false
    },
    applicationsCount: {
      type: Number,
      default: 0
    },
    viewsCount: {
      type: Number,
      default: 0
    },
    employer: {
      type: Schema.Types.ObjectId,
      ref: 'Employer',
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes for better performance
JobSchema.index({ title: 'text', description: 'text', skills: 'text' });
JobSchema.index({ status: 1, type: 1, experience: 1 });
JobSchema.index({ employer: 1 });
JobSchema.index({ isRemote: 1 });
JobSchema.index({ applicationsCount: -1 });
JobSchema.index({ createdAt: -1 });

export default mongoose.model<IJob>('Job', JobSchema);
