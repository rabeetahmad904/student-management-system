import express from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getDashboardStats,
} from '../controllers/studentController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, getDashboardStats);
router.route('/')
  .get(protect, getStudents)
  .post(protect, adminOnly, createStudent);

router.route('/:id')
  .get(protect, getStudentById)
  .put(protect, adminOnly, updateStudent)
  .delete(protect, adminOnly, deleteStudent);

export default router;