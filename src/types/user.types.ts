// USERS data
export interface EmployeeData {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  jobInfo: {
    jobTitle: string;
    skills: string[];
    experienceDescription: string;
    experienceLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'other';
    yearsOfExperience: number;
    educationalStatus: string;
    lastWork?: string;
  };
  isActive?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface EmployerData {
  _id: string;
  companyName: string;
  email: string;
  phoneNumber: string;
  details: {
    industry: string;
    contactName: string;
    contactPosition: string;
    [key: string]: any; // Allow for additional fields
  };
  isActive?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}