
import React, { useState } from 'react';
import { ArrowLeft, Save, Upload, RefreshCw } from 'lucide-react';
import { Employee, Branch, Department } from '../types';
import { api } from '../services/api';
interface AddEmployeeProps {
  onBack: () => void;
  onSave: (employee: Employee) => void;
  employees: Employee[];
  branches: Branch[];
  departments: Department[];
}


const AddEmployee: React.FC<AddEmployeeProps> = ({ onBack, onSave, employees, branches, departments }) => {
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '',
    password: '', 
    email: '',
    phone: '',
    department: '',
    designation: '',
    joinDate: '',
    status: 'Active',
    employeeId: '',
    // location: 'New York (HQ)',
    branchid: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateEmployeeId = () => {
      const dept = formData.department || 'Engineering';
      const prefixMap: Record<string, string> = {
        'Engineering': 'ENG',
        'Marketing': 'MKT',
        'Sales': 'SLS',
        'HR': 'HRD',
        'Finance': 'FIN',
        'Operations': 'OPS'
      };
      const prefix = prefixMap[dept] || 'EMP';
      
      // Find existing IDs with this prefix - safely handle undefined employees or missing employeeId
      const existingIds = (employees || [])
        .filter(e => e && e.employeeId && e.employeeId.startsWith(prefix))
        .map(e => parseInt(e.employeeId.replace(prefix + '-', ''), 10))
        .filter(n => !isNaN(n));
      
      const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
      const nextId = maxId + 1;
      const newId = `${prefix}-${String(nextId).padStart(3, '0')}`;
      
      setFormData(prev => ({ ...prev, employeeId: newId }));
  };

//   const handleSubmit = () => {
//     // Basic validation
//     if (!formData.name || !formData.email || !formData.employeeId || !formData.password) {
//         alert("Please fill in required fields (name, email, employeeId, password)");
//         return;
//     }

//     // Check for duplicate ID - safely handle undefined employees
//     if ((employees || []).some(e => e && e.employeeId === formData.employeeId)) {
//         alert(`Employee ID ${formData.employeeId} already exists. Please generate a new one.`);
//         return;
//     }

//     // Confirmation dialog
//     if (!window.confirm('Are you sure you want to add this new employee? This will create both an employee record and a user account.')) {
//         return;
//     }

//     const newEmployee: Employee = {
//         id: '', // Will be set by parent
//         employeeId: formData.employeeId || '',
//         name: formData.name || '',
//         email: formData.email || '',
//         department: formData.department || '',
//         designation: formData.designation || '',
//         status: (formData.status as any) || 'Active',
//         joinDate: formData.joinDate || new Date().toISOString().split('T')[0],
//         avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'User')}&background=random`,
//         phone: formData.phone,
//         location: formData.location,
//         branchid: formData.branchid || ''
//     };

//     // Create user record linked to employee
//     const userPayload = {
//         name: formData.name,
//         email: formData.email,
//         password: formData.password,
//         role: 'employee',
//         avatar: newEmployee.avatar,
//         designation: formData.designation,
//         branchIds: formData.branchid ? [formData.branchid] : [],
//         accessModules: ['dashboard'],
//         linkedEmployee: {
//             name: newEmployee.name,
//             email: newEmployee.email,
//             designation: newEmployee.designation,
//             branchid: formData.branchid || '',
//         }
//     };
//     import('../services/api').then(({ api }) => {
//       api.create('users', userPayload)
//         .then(res => {
//           alert('Employee and user created successfully!');
//           onSave(newEmployee);
//         })
//         .catch(err => {
//           alert('Error creating user/employee: ' + err.message);
//         });
//     });
//   };

const handleSubmit = async () => {
  try {
    if (!formData.name || !formData.email || !formData.password) {
      alert('Required fields missing');
      return;
    }

    // 1️ CREATE EMPLOYEE FIRST
    const employeePayload = {
      id: `emp_${Date.now()}`,
      employeeId: formData.employeeId,
      name: formData.name,
      email: formData.email,
      department: formData.department,
      designation: formData.designation,
      joinDate: formData.joinDate,
      phone: formData.phone,
      status: formData.status,
      branchid: formData.branchid
    };

    const employee = await api.create('employees', employeePayload);

    // 2️ CREATE USER USING employee.id
    const userPayload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: 'employee',
      designation: formData.designation,
      branchIds: [formData.branchid],
      linkedEmployeeId: employee.id,
      accessModules: ['dashboard']
    };

    await api.create('users', userPayload);

    alert('Employee & User created successfully');
    onBack();

  } catch (err: any) {
    alert(err.message);
  }
};
  

return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
            <button 
                onClick={onBack}
                className="p-2 hover:bg-white hover:shadow-sm rounded-full transition-all"
            >
                <ArrowLeft size={24} className="text-slate-600" />
            </button>
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Add New Employee</h1>
                <p className="text-slate-500 mt-1">Create a new employee profile with comprehensive details.</p>
            </div>
        </div>
        <div className="flex space-x-3">
            <button 
                onClick={onBack}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-white hover:shadow-sm font-medium transition-all"
            >
                Cancel
            </button>
            <button 
                onClick={handleSubmit}
                className="bg-gradient-to-r from-accent-500 to-accent-600 text-white px-6 py-2 rounded-xl flex items-center space-x-2 hover:shadow-lg hover:shadow-orange-500/30 transition-all font-medium"
            >
                <Save size={18} />
                <span>Save Profile</span>
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Image & Basic Info */}
        <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg shadow-slate-200/50 border border-white/20 text-center">
                <div className="w-32 h-32 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-dashed border-slate-300 relative overflow-hidden group cursor-pointer">
                    <Upload size={32} className="text-slate-400 group-hover:text-accent-500 transition-colors" />
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <button className="text-accent-600 font-medium text-sm hover:underline">Upload Photo</button>
                <p className="text-xs text-slate-400 mt-2">Allowed *.jpeg, *.jpg, *.png, *.gif <br/> Max size of 3 MB</p>
            </div>
            
             <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg shadow-slate-200/50 border border-white/20">
                <h3 className="font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">Account Login</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Official Email</label>
                        <input name="email" value={formData.email} onChange={handleChange} type="email" placeholder="john.doe@company.com" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input
                          name="password"                 //  REQUIRED
                          value={formData.password || ''} //  controlled
                          onChange={handleChange}         //  updates state
                          type="password"
                          placeholder="••••••••"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/50"
                        />

                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                        <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/50 text-sm">
                            <option>Employee</option>
                            <option>Manager</option>
                            <option>Admin</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Detailed Forms */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg shadow-slate-200/50 border border-white/20">
                <h3 className="font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                        <input name="name" value={formData.name} onChange={handleChange} type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                        <input name="phone" value={formData.phone} onChange={handleChange} type="tel" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                        <input type="date" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                        <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/50 text-sm">
                            <option>Select Gender</option>
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Marital Status</label>
                        <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/50 text-sm">
                            <option>Single</option>
                            <option>Married</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                        <textarea className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 text-sm" rows={3}></textarea>
                    </div>
                </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg shadow-slate-200/50 border border-white/20">
                <h3 className="font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Department <span className="text-red-500">*</span></label>
                       <select
                         name="department"
                         value={formData.department}
                         onChange={handleChange}
                       >
                         <option value="">Select Department</option>
                         {(departments || []).map((dept) => (
                           <option key={dept.id} value={dept.name}>
                             {dept.name}
                           </option>
                         ))}
                       </select>


                    </div>
                    <div className="relative">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Employee ID <span className="text-red-500">*</span></label>
                        <div className="flex gap-2">
                            <input name="employeeId" value={formData.employeeId} onChange={handleChange} type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 text-sm" placeholder="EMP-XXXX" />
                            <button onClick={generateEmployeeId} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 rounded-xl border border-slate-200 transition-colors" title="Auto Generate ID">
                                <RefreshCw size={16} />
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Designation <span className="text-red-500">*</span></label>
                        <input name="designation" value={formData.designation} onChange={handleChange} type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date of Joining <span className="text-red-500">*</span></label>
                        <input name="joinDate" value={formData.joinDate} onChange={handleChange} type="date" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/50 text-sm">
                            <option value="Active">Active</option>
                            <option value="On Leave">On Leave</option>
                            <option value="Terminated">Terminated</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Branch <span className="text-red-500">*</span></label>
                        <select
                          name="branchid"
                          value={formData.branchid}
                          onChange={handleChange}
                        >
                          <option value="">Select Branch</option>
                          {(branches || []).map((branch) => (
                            <option key={branch.id} value={branch.id}>
                              {branch.name} ({branch.city})
                            </option>
                          ))}
                        </select>


                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AddEmployee;
