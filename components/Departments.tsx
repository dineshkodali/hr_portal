import React, { useState } from "react";
import ReactDOM from "react-dom";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Users,
  X,
  Building2,
  User,
} from "lucide-react";
import { Department, DepartmentsProps } from "../types";

const Departments: React.FC<DepartmentsProps> = ({
  departments,
  employees,
  branches,
  onAddDepartment,
  onUpdateDepartment,
  onDeleteDepartment,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState<Partial<Department>>({
    name: "",
    manager: "",
    employeeCount: 0,
    location: "",
    status: "Active",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);

  // Refresh departments after any change
  const refreshDepartments = async () => {
    setLoading(true);
    setError(null);
    try {
      // Assume api.get is available globally or via props
      if (typeof window !== "undefined" && window.api && window.api.get) {
        await window.api.get("departments");
      }
    } catch (err: any) {
      setError("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  const [sortBy, setSortBy] = useState<
    "name" | "manager" | "status" | "location"
  >("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  console.log("Departments data:", departments);

  let filteredDepts = departments.filter((d) => {
    const managerNames = (d.managerids ?? [])
      .map((id) => employees.find((e) => e.id === id)?.name ?? "")
      .join(" ")
      .toLowerCase();

    return (
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      managerNames.includes(searchTerm.toLowerCase())
    );
  });

  filteredDepts = filteredDepts.sort((a, b) => {
    let valA = "";
    let valB = "";

    switch (sortBy) {
      case "manager": {
        const managerA = a.managerids?.[0]
          ? employees.find((e) => e.id === a.managerids[0])
          : null;

        const managerB = b.managerids?.[0]
          ? employees.find((e) => e.id === b.managerids[0])
          : null;

        valA = managerA?.name?.toLowerCase() ?? "";
        valB = managerB?.name?.toLowerCase() ?? "";
        break;
      }

      case "location": {
        const branchA = branches.find((br) => br.id === a.branchid);
        const branchB = branches.find((br) => br.id === b.branchid);

        valA = branchA?.city?.toLowerCase() ?? "";
        valB = branchB?.city?.toLowerCase() ?? "";
        break;
      }

      case "status":
        valA = (a.status ?? "").toLowerCase();
        valB = (b.status ?? "").toLowerCase();
        break;

      default: // "name"
        valA = (a.name ?? "").toLowerCase();
        valB = (b.name ?? "").toLowerCase();
    }

    if (valA < valB) return sortDir === "asc" ? -1 : 1;
    if (valA > valB) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const handleEditClick = (dept: Department) => {
    setEditingDept(dept);
    setFormData(dept);
    // Preselect staff assigned to this department
    setSelectedStaff(
      employees.filter((e) => e.department === dept.name).map((e) => e.id)
    );
    setIsModalOpen(true);
  };

  const handleViewClick = (dept: Department) => {
    setEditingDept(dept);
    setIsViewModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingDept(null);
    setFormData({
      name: "",
      manager: "",
      employeeCount: 0,
      location: "",
      status: "Active",
    });
    setSelectedStaff([]);
    setIsModalOpen(true);
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //     e.preventDefault();
  //     setError(null);
  //     setLoading(true);
  //     try {
  //         if (formData.name && formData.manager) {
  //             const data = {
  //                 ...formData as Department,
  //                 id: editingDept ? editingDept.id : `dept-${Date.now()}`,
  //                 employeeCount: selectedStaff.length
  //             };
  //             if (editingDept) {
  //                 await onUpdateDepartment(data);
  //             } else {
  //                 await onAddDepartment(data);
  //             }
  //             // Update staff assignments
  //             for (const emp of employees) {
  //                 const shouldAssign = selectedStaff.includes(emp.id);
  //                 if ((shouldAssign && emp.department !== formData.name) || (!shouldAssign && emp.department === formData.name)) {
  //                     await fetch(`http://localhost:3001/api/employees/${emp.id}`, {
  //                         method: 'PUT',
  //                         headers: { 'Content-Type': 'application/json' },
  //                         body: JSON.stringify({ ...emp, department: shouldAssign ? formData.name : '' })
  //                     });
  //                 }
  //             }
  //             setIsModalOpen(false);
  //             await refreshDepartments();
  //             // Optionally: trigger employee refresh if available
  //             if (typeof window !== 'undefined' && window.api && window.api.get) {
  //                 await window.api.get('employees');
  //             }
  //         }
  //     } catch (err: any) {
  //         setError('Failed to save department');
  //     } finally {
  //         setLoading(false);
  //     }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.name || !formData.manager) return;

      const data = {
        id: editingDept ? editingDept.id : `dept-${Date.now()}`,
        name: formData.name,
        description: formData.description || "",
        managerids: [formData.manager], // ✅ array of employee IDs
        employeeCount: selectedStaff.length,
        branchId:
          branches.find((b) => `${b.city}, ${b.country}` === formData.location)
            ?.id || null,
      };

      if (editingDept) {
        await onUpdateDepartment(data);
      } else {
        await onAddDepartment(data);
      }

      // Update employee department assignment
      for (const emp of employees) {
        const shouldAssign = selectedStaff.includes(emp.id);

        if (
          (shouldAssign && emp.department !== formData.name) ||
          (!shouldAssign && emp.department === formData.name)
        ) {
          // Strip DB-managed fields
          // const { created_at, updated_at, ...safeEmp } = emp as any;

          // await fetch(`http://localhost:3001/api/employees/${emp.id}`, {
          //   method: "PUT",
          //   headers: { "Content-Type": "application/json" },
          //   body: JSON.stringify({
          //     ...safeEmp,
          //     department: shouldAssign ? formData.name : "",
          //   }),
          // });

          const employeePayload = {
            name: emp.name,
            email: emp.email,
            phone: emp.phone,
            designation: emp.designation,
            department: shouldAssign ? formData.name : "",
            branchid: emp.branchid ?? null,
            joindate: emp.joindate ?? null,
            status: emp.status,
            salary: emp.salary,
            avatar: emp.avatar ?? null,
            address: emp.address ?? null,
            city: emp.city ?? null,
            state: emp.state ?? null,
            zipcode: emp.zipcode ?? null,
            country: emp.country ?? null,
            emergencycontact: emp.emergencycontact ?? null,
            emergencyphone: emp.emergencyphone ?? null,
            bankaccount: emp.bankaccount ?? null,
            bankname: emp.bankname ?? null,
            ifsccode: emp.ifsccode ?? null,
            employeeid: emp.employeeid ?? null,
          };

          await fetch(`http://localhost:3001/api/employees/${emp.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(employeePayload),
          });
        }
      }

      setIsModalOpen(false);
      await refreshDepartments();
    } catch (err) {
      setError("Failed to save department");
    } finally {
      setLoading(false);
    }
  };

  const departmentEmployees = editingDept
    ? employees.filter((e) => e.department === editingDept.name)
    : [];

  return (
    <>
      <div className="animate-in fade-in duration-300">
        {error && (
          <div className="bg-red-50 text-red-700 p-2 rounded-xl mb-2 text-center font-bold">
            {error}
          </div>
        )}
        {loading && (
          <div className="text-slate-400 text-xs mb-2 text-center">
            Loading...
          </div>
        )}
        {/* Compact Toolbar */}
        <div className="p-2 md:p-3 border-b border-slate-100 flex flex-col md:flex-row gap-2 md:gap-3 bg-white/50">
          <div className="relative flex-1">
            <Search
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search departments..."
              className="w-full pl-8 pr-2 py-1.5 md:py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500/40 focus:border-accent-500 text-xs md:text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={handleAddClick}
            className="bg-accent-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg flex items-center space-x-1.5 hover:bg-accent-600 shadow-sm transition-all font-bold text-xs md:text-sm whitespace-nowrap"
          >
            <Plus size={14} /> <span>Add</span>
          </button>
        </div>
        {/* Professional Table Layout */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th
                  className="p-2 md:p-3 cursor-pointer"
                  onClick={() => {
                    setSortBy("name");
                    setSortDir(
                      sortBy === "name" && sortDir === "asc" ? "desc" : "asc"
                    );
                  }}
                >
                  Unit{" "}
                  {sortBy === "name" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                </th>
                <th
                  className="p-2 md:p-3 cursor-pointer"
                  onClick={() => {
                    setSortBy("manager");
                    setSortDir(
                      sortBy === "manager" && sortDir === "asc" ? "desc" : "asc"
                    );
                  }}
                >
                  Manager{" "}
                  {sortBy === "manager" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                </th>
                <th className="p-2 md:p-3">Staff</th>
                <th
                  className="p-2 md:p-3 cursor-pointer"
                  onClick={() => {
                    setSortBy("location");
                    setSortDir(
                      sortBy === "location" && sortDir === "asc"
                        ? "desc"
                        : "asc"
                    );
                  }}
                >
                  Location{" "}
                  {sortBy === "location" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                </th>
                {/* <th className="p-2 md:p-3 cursor-pointer" onClick={() => { setSortBy('status'); setSortDir(sortBy === 'status' && sortDir === 'asc' ? 'desc' : 'asc'); }}>
                                    Status {sortBy === 'status' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                                </th> */}
                <th className="p-2 md:p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDepts.map((dept) => (
                <tr
                  key={dept.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  <td className="p-2 md:p-3">
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <div className="p-1.5 md:p-2 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-accent-50 group-hover:text-accent-600 transition-colors">
                        <Building2 size={14} />
                      </div>
                      <span className="text-xs md:text-sm font-bold text-slate-700">
                        {dept.name}
                      </span>
                    </div>
                  </td>
                  <td className="p-2 md:p-3">
                    {dept.managerids && dept.managerids.length > 0 ? (
                      dept.managerids.map((managerid) => {
                        const manager = employees.find(
                          (e) => e.id === managerid
                        );

                        if (!manager) {
                          return (
                            <span
                              key={managerid}
                              className="text-slate-400 italic"
                            >
                              Unknown
                            </span>
                          );
                        }

                        return (
                          <div
                            key={managerid}
                            className="flex items-center gap-2"
                          >
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-black">
                              {manager.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                            <span className="text-sm font-medium">
                              {manager.name}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-slate-400 italic">—</span>
                    )}
                  </td>

                  <td className="p-2 md:p-3">
                    <div className="flex items-center space-x-1 text-slate-500">
                      <Users size={12} />
                      <span className="text-xs md:text-sm font-bold text-slate-700">
                        {
                          // employees.filter((e) => e.department === dept.name)
                          //   .length
                          dept.employeecount
                        }
                      </span>
                    </div>
                  </td>
                  <td className="p-2 md:p-3">
                    {dept.branchid ? (
                      (() => {
                        const branch = branches.find(
                          (b) => b.id === dept.branchid
                        );

                        if (!branch) {
                          return (
                            <span className="text-slate-400 italic">
                              Unknown
                            </span>
                          );
                        }

                        return (
                          <div className="flex items-center gap-1">
                            <MapPin size={12} className="text-slate-300" />
                            <span className="text-sm">
                              {branch.city}, {branch.country}
                            </span>
                          </div>
                        );
                      })()
                    ) : (
                      <span className="text-slate-400 italic">—</span>
                    )}
                  </td>

                  {/* <td className="p-2 md:p-3">
                                        <span className={`px-2 py-0.5 text-[9px] md:text-[10px] font-black uppercase rounded-lg border tracking-wider ${
                                            dept?.status === 'Active' ? 'bg-green-50 text-green-700 border-green-100' : 
                                            'bg-slate-100 text-slate-500 border-slate-200'
                                        }`}>
                                            {dept?.status}
                                        </span>
                                    </td> */}
                  <td className="p-2 md:p-3 text-right">
                    <div className="flex justify-end gap-0.5 md:gap-1">
                      <button
                        onClick={() => handleViewClick(dept)}
                        className="p-1.5 md:p-2 text-slate-400 hover:text-blue-600"
                        title="View"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleEditClick(dept)}
                        className="p-1.5 md:p-2 text-slate-400 hover:text-slate-800"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm("Delete unit?"))
                            onDeleteDepartment(dept.id);
                        }}
                        className="p-1.5 md:p-2 text-slate-400 hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDepts.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-12 text-center text-slate-400 italic font-medium"
                  >
                    No department units found matching search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Modal overlays rendered using React portal for true overlay effect */}
      {isModalOpen &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 z-[120] flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            ></div>
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200 border border-slate-100">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
                <h3 className="font-black text-slate-900 text-xl tracking-tight">
                  {editingDept ? "Edit Department" : "Create New Department"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                    Department Name
                  </label>
                  <input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    type="text"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-accent-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                    Department Manager
                  </label>
                  <select
                    value={formData.manager}
                    onChange={(e) =>
                      setFormData({ ...formData, manager: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none"
                    required
                  >
                    <option value="">Select Manager</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                    Assign Staff
                  </label>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto">
                    {employees.map((emp) => (
                      <label
                        key={emp.id}
                        className="flex items-center gap-2 text-xs font-medium text-slate-700"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStaff.includes(emp.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStaff((prev) => [...prev, emp.id]);
                            } else {
                              setSelectedStaff((prev) =>
                                prev.filter((id) => id !== emp.id)
                              );
                            }
                          }}
                        />
                        {emp.name}{" "}
                        <span className="text-slate-400">
                          ({emp.designation})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                    Primary Location
                  </label>
                  <select
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none"
                  >
                    <option value="">Select Location</option>
                    {branches.map((branch) => (
                      <option
                        key={branch.id}
                        value={`${branch.city}, ${branch.country}`}
                      >
                        {branch.city} ({branch.name})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                    Operating Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-accent-500 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:bg-accent-600 transition-all text-base"
                >
                  {editingDept ? "Update Department" : "Create Department"}
                </button>
              </form>
            </div>
          </div>,
          document.body
        )}
      {isViewModalOpen &&
        editingDept &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-200">
              <div className="p-8 border-b border-gray-100 flex justify-between items-start bg-white">
                <div>
                  <h3 className="font-black text-slate-900 text-2xl tracking-tighter uppercase">
                    {editingDept.name}
                  </h3>
                  <div className="flex gap-4 mt-2">
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                      <User size={14} className="text-accent-500" /> Manager:
                      {editingDept.managerids?.length
                        ? employees.find(
                            (e) => e.id === editingDept.managerids[0]
                          )?.name ?? "—"
                        : "—"}
                    </span>

                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                      <MapPin size={14} className="text-accent-500" />
                      {branches.find((b) => b.id === editingDept.branchid)
                        ? `${
                            branches.find((b) => b.id === editingDept.branchid)!
                              .city
                          }, ${
                            branches.find((b) => b.id === editingDept.branchid)!
                              .country
                          }`
                        : "—"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 bg-slate-50/30">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-[0.3em]">
                    Operational Roster
                  </h4>
                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full border tracking-widest ${
                      editingDept.status === "Active"
                        ? "bg-green-50 text-green-700 border-green-100"
                        : "bg-slate-100 text-slate-500 border-slate-200"
                    }`}
                  >
                    {editingDept.status}
                  </span>
                </div>
                <div className="max-h-80 overflow-y-auto pr-4 custom-scrollbar">
                  {departmentEmployees.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {departmentEmployees.map((emp) => (
                        <div
                          key={emp.id}
                          className="flex items-center space-x-3 p-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-accent-200 transition-all group"
                        >
                          <img
                            src={emp.avatar}
                            alt={emp.name}
                            className="w-10 h-10 rounded-xl border border-slate-50 object-cover"
                          />
                          <div className="overflow-hidden">
                            <p className="text-sm font-bold text-slate-800 truncate">
                              {emp.name}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                              {emp.designation}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
                      <Users
                        size={32}
                        className="mx-auto text-slate-200 mb-3"
                      />
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                        Zero staff assigned to unit
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 flex justify-end bg-white">
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-8 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default Departments;
