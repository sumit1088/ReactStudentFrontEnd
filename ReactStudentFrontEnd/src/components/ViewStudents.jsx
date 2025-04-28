import React, { useEffect, useState } from 'react';
import DashboardLayout from "./DashboardLayout";

const ViewStudents = () => {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'created', direction: 'desc' });
  const itemsPerPage = 5;

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const res = await fetch('https://localhost:7020/api/Students');
    const data = await res.json();
    setStudents(data);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      await fetch(`https://localhost:7020/api/Students/${id}`, {
        method: 'DELETE'
      });
      fetchStudents(); // Refresh list after deletion
    }
  };

  const handleEdit = (studentId) => {
    // Redirect or open modal - here just console log
    console.log("Edit Student ID:", studentId);
    // You can navigate to edit page like: navigate(`/edit-student/${studentId}`);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  const sortedStudents = [...students].sort((a, b) => {
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredStudents = sortedStudents.filter(student =>
    student.firstname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.surname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.className?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.medium?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const exportToCSV = () => {
    const csv = [
      ['ID', 'Surname', 'First Name', 'Last Name', 'Mother Name', 'Class', 'Medium', 'School', 'Center', 'Created'],
      ...filteredStudents.map(s => [
        s.id,
        s.surname,
        s.firstname,
        s.lastname,
        s.motherName,
        s.className,
        s.medium,
        s.school?.name,
        s.center?.name,
        new Date(s.created).toLocaleString()
      ])
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'students.csv';
    link.click();
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Student List</h2>
            <button
              onClick={exportToCSV}
              className="bg-green-600 text-white px-4 py-1.5 rounded hover:bg-green-700 text-sm"
            >
              Export CSV
            </button>
          </div>

          <input
            type="text"
            placeholder="Search by name, class or medium..."
            className="mb-4 w-full px-3 py-2 border rounded"
            value={searchQuery}
            onChange={handleSearch}
          />

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left border border-gray-200">
              <thead className="bg-blue-100">
                <tr>
                  <th className="p-3 border">#</th>
                  {['surname', 'firstname', 'lastname', 'motherName', 'className', 'medium', 'school.name', 'center.name', 'created'].map((key) => (
                    <th
                      key={key}
                      className="p-3 border cursor-pointer hover:bg-blue-200"
                      onClick={() => handleSort(key.includes('.') ? key.split('.')[0] : key)}
                    >
                      {key.split('.')[0].charAt(0).toUpperCase() + key.split('.')[0].slice(1)}
                      {sortConfig.key === (key.includes('.') ? key.split('.')[0] : key) ? ` (${sortConfig.direction})` : ''}
                    </th>
                  ))}
                  <th className="p-3 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((student, index) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="p-3 border">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="p-3 border">{student.surname}</td>
                    <td className="p-3 border">{student.firstname}</td>
                    <td className="p-3 border">{student.lastname}</td>
                    <td className="p-3 border">{student.motherName}</td>
                    <td className="p-3 border">{student.className}</td>
                    <td className="p-3 border">{student.medium}</td>
                    <td className="p-3 border">{student.school?.name}</td>
                    <td className="p-3 border">{student.center?.name}</td>
                    <td className="p-3 border">{new Date(student.created).toLocaleString()}</td>
                    <td className="p-3 border flex gap-2">
                      <button
                        onClick={() => handleEdit(student.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {paginatedStudents.length === 0 && (
                  <tr>
                    <td colSpan="11" className="text-center p-4 text-gray-500">
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-center space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`px-3 py-1 border rounded ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white'}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ViewStudents;
