import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    rollNumber: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    semester: { type: String, required: true },
    status: { type: String, enum: ['Active', 'Inactive', 'Graduated'], default: 'Active' },
  },
  { timestamps: true }
);

export default mongoose.model('Student', studentSchema);