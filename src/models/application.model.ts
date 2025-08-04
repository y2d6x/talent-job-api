import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IApplication extends Document {
  employee: Types.ObjectId;
  job: Types.ObjectId;
  status: 'Pending' | 'Reviewed' | 'Shortlisted' | 'Interviewed' | 'Accepted' | 'Rejected';
  coverLetter?: string;
  resume?: string;
  expectedSalary?: number;
  appliedAt: Date;
  reviewedAt?: Date;
  employerNotes?: string;
  employeeNotes?: string;
  isWithdrawn: boolean;
  withdrawnAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema: Schema<IApplication> = new Schema(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Reviewed', 'Shortlisted', 'Interviewed', 'Accepted', 'Rejected'],
      default: 'Pending',
    },
    coverLetter: {
      type: String,
      trim: true
    },
    resume: {
      type: String,
      trim: true
    },
    expectedSalary: {
      type: Number,
      min: 0
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date
    },
    employerNotes: {
      type: String,
      trim: true
    },
    employeeNotes: {
      type: String,
      trim: true
    },
    isWithdrawn: {
      type: Boolean,
      default: false
    },
    withdrawnAt: {
      type: Date
    }
  },
  { timestamps: true }
);

// Indexes for better performance
ApplicationSchema.index({ employee: 1, job: 1 }, { unique: true });
ApplicationSchema.index({ employee: 1, status: 1 });
ApplicationSchema.index({ job: 1, status: 1 });
ApplicationSchema.index({ status: 1, appliedAt: -1 });
ApplicationSchema.index({ isWithdrawn: 1 });

export default mongoose.model<IApplication>('Application', ApplicationSchema);
