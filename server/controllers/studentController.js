import Student from '../models/Student.js';

// @desc Get all students with search, filter & pagination
// @route GET /api/students
export const getStudents = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: 'i' } },
            { rollNumber: { $regex: req.query.search, $options: 'i' } },
            { department: { $regex: req.query.search, $options: 'i' } },
          ],
        }
      : {};

    const count = await Student.countDocuments({ ...search });
    const students = await Student.find({ ...search })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * (page - 1));

    res.json({
      students,
      page,
      pages: Math.ceil(count / limit),
      totalStudents: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get single student details
// @route GET /api/students/:id
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Add new student
// @route POST /api/students
export const createStudent = async (req, res) => {
  const { rollNumber, name, email, department, semester, status } = req.body;

  try {
    const exists = await Student.findOne({ rollNumber });
    if (exists) {
      return res.status(400).json({ message: 'Student with this Roll Number already exists' });
    }

    const student = await Student.create({
      rollNumber,
      name,
      email,
      department,
      semester,
      status,
    });

    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update student details
// @route PUT /api/students/:id
export const updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    Object.assign(student, req.body);
    const updatedStudent = await student.save();
    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete student
// @route DELETE /api/students/:id
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    await student.deleteOne();
    res.json({ message: 'Student record removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get Dashboard Analytical Statistics
// @route GET /api/students/stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ status: 'Active' });
    const recentRegistrations = await Student.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalStudents,
      activeStudents,
      recentRegistrations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};