import { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { 
  Users, UserCheck, Plus, Search, Edit3, Trash2, Eye, LogOut, ChevronLeft, ChevronRight, X 
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  
  // Data States
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({ totalStudents: 0, activeStudents: 0, recentRegistrations: [] });
  const [loading, setLoading] = useState(true);
  
  // Query States
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    rollNumber: '', name: '', email: '', department: '', semester: '', status: 'Active'
  });
  const [formError, setFormError] = useState('');

  // Fetch Dashboard Stats & Student Records
  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, studentsRes] = await Promise.all([
        API.get('/students/stats'),
        API.get(`/students?search=${search}&page=${page}&limit=5`)
      ]);
      setStats(statsRes.data);
      setStudents(studentsRes.data.students);
      setTotalPages(studentsRes.data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, page]);

  // Open Add/Edit Modal
  const handleOpenForm = (student = null) => {
    setFormError('');
    if (student) {
      setSelectedStudent(student);
      setFormData(student);
    } else {
      setSelectedStudent(null);
      setFormData({ rollNumber: '', name: '', email: '', department: '', semester: '', status: 'Active' });
    }
    setIsFormOpen(true);
  };

  // Submit Add or Edit Student Form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      if (selectedStudent) {
        await API.put(`/students/${selectedStudent._id}`, formData);
      } else {
        await API.post('/students', formData);
      }
      setIsFormOpen(false);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed');
    }
  };

  // Delete Student
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student record?')) {
      try {
        await API.delete(`/students/${id}`);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete student');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <Users size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">EduPulse</h1>
            <p className="text-xs text-slate-400">Student Management System</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white">{user?.name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${user?.role === 'Admin' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-blue-500/20 text-blue-400'}`}>
              {user?.role}
            </span>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-1 bg-slate-700 hover:bg-red-600 text-slate-200 hover:text-white px-3 py-2 rounded-lg transition text-sm"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Statistics Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-semibold text-slate-400">Total Students</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">{stats.totalStudents}</h3>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
              <Users size={28} />
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-semibold text-slate-400">Active Enrolled</p>
              <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">{stats.activeStudents}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <UserCheck size={28} />
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <p className="text-xs uppercase font-semibold text-slate-400 mb-2">Recent Registrations</p>
            <div className="space-y-1">
              {stats.recentRegistrations?.slice(0, 2).map((st) => (
                <div key={st._id} className="text-xs text-slate-300 truncate">
                  • <span className="font-semibold text-white">{st.name}</span> ({st.department})
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Header: Search & Add */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search by name, roll number or department..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          {user?.role === 'Admin' && (
            <button
              onClick={() => handleOpenForm()}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-lg transition"
            >
              <Plus size={18} />
              <span>Add Student</span>
            </button>
          )}
        </div>

        {/* Students Table */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/60 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="py-3 px-4">Roll No</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400">Loading records...</td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400">No student records found.</td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student._id} className="hover:bg-slate-700/30 transition">
                      <td className="py-3.5 px-4 font-mono text-blue-400">{student.rollNumber}</td>
                      <td className="py-3.5 px-4 font-medium text-white">{student.name}</td>
                      <td className="py-3.5 px-4">{student.department}</td>
                      <td className="py-3.5 px-4">{student.semester}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                          student.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          student.status === 'Inactive' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-slate-700 text-slate-400'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => { setSelectedStudent(student); setIsDetailOpen(true); }}
                            className="p-1.5 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          
                          {user?.role === 'Admin' && (
                            <>
                              <button
                                onClick={() => handleOpenForm(student)}
                                className="p-1.5 hover:bg-blue-600/20 rounded-md text-blue-400 transition"
                                title="Edit"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(student._id)}
                                className="p-1.5 hover:bg-red-600/20 rounded-md text-red-400 transition"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="bg-slate-900/40 px-4 py-3 border-t border-slate-700 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Page <span className="font-semibold text-white">{page}</span> of <span className="font-semibold text-white">{totalPages || 1}</span>
            </span>
            <div className="flex space-x-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg disabled:opacity-40 disabled:hover:bg-slate-700 text-white transition"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => prev + 1)}
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg disabled:opacity-40 disabled:hover:bg-slate-700 text-white transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md p-6 relative shadow-2xl">
            <button onClick={() => setIsFormOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold text-white mb-4">
              {selectedStudent ? 'Edit Student Record' : 'Add New Student'}
            </h3>

            {formError && <div className="mb-4 p-2.5 bg-red-500/10 border border-red-500/40 text-red-400 rounded-lg text-xs">{formError}</div>}

            <form onSubmit={handleFormSubmit} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Roll Number</label>
                <input
                  type="text" required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                <input
                  type="text" required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Email</label>
                <input
                  type="email" required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Department</label>
                  <input
                    type="text" required
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Semester</label>
                  <input
                    type="text" required
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Status</label>
                <select
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Graduated">Graduated</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-xs font-medium"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {isDetailOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-sm p-6 relative shadow-2xl space-y-4">
            <button onClick={() => setIsDetailOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2">Student Profile</h3>
            
            <div className="space-y-2 text-sm text-slate-300">
              <p><strong className="text-slate-400">Name:</strong> {selectedStudent.name}</p>
              <p><strong className="text-slate-400">Roll No:</strong> <span className="font-mono text-blue-400">{selectedStudent.rollNumber}</span></p>
              <p><strong className="text-slate-400">Email:</strong> {selectedStudent.email}</p>
              <p><strong className="text-slate-400">Department:</strong> {selectedStudent.department}</p>
              <p><strong className="text-slate-400">Semester:</strong> {selectedStudent.semester}</p>
              <p><strong className="text-slate-400">Enrolled Status:</strong> {selectedStudent.status}</p>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setIsDetailOpen(false)}
                className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}