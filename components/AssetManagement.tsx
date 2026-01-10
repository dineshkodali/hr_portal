
import React, { useState,useEffect,useRef } from 'react';
import { Monitor, Smartphone, Plus, Search, Filter, Edit, Trash2, Eye, Laptop, Mouse, X, Upload, Link, ArrowRight, Image as ImageIcon, ArrowRightLeft } from 'lucide-react';
import { Asset, StatCardProps, SystemConfig, Employee, Branch, User } from '../types';
interface AssetManagementProps {
  user: User;
  assets: Asset[];
  employees: Employee[];
  branches: Branch[];
  systemConfig: SystemConfig;
  onAddAsset: (asset: Asset) => void;
  onUpdateAsset: (asset: Asset) => void;
  onDeleteAsset: (id: string) => void;
}

// Sample Assets Data
const SAMPLE_ASSETS: Asset[] = [
  {
    id: 'asset-001',
    name: 'Dell XPS 13 Laptop',
    type: 'Laptop',
    serialnumber: 'DELL-XPS-001',
    status: 'Assigned',
    assignedto: 'John Doe',
    purchasedate: '2024-01-15',
    branchId: 'branch-1',
    image: '',
    condition: 'Good'
  },
  {
    id: 'asset-002',
    name: 'HP ProBook 450',
    type: 'Laptop',
    serialnumber: 'HP-PB450-002',
    status: 'Assigned',
    assignedto: 'Jane Smith',
    purchasedate: '2024-02-20',
    branchId: 'branch-1',
    image: '',
    condition: 'Good'
  },
  {
    id: 'asset-003',
    name: 'Apple MacBook Pro 14"',
    type: 'Laptop',
    serialnumber: 'MAC-PRO-003',
    status: 'Available',
    assignedto: null,
    purchasedate: '2024-03-10',
    branchId: 'branch-2',
    image: '',
    condition: 'New'
  },
  {
    id: 'asset-004',
    name: 'Dell Desktop Tower',
    type: 'Desktop',
    serialnumber: 'DELL-DT-004',
    status: 'Assigned',
    assignedto: 'Robert Johnson',
    purchasedate: '2023-11-05',
    branchId: 'branch-1',
    image: '',
    condition: 'Fair'
  },
  {
    id: 'asset-005',
    name: 'LG 27" Monitor',
    type: 'Monitor',
    serialnumber: 'LG-MON-005',
    status: 'Assigned',
    assignedto: 'Robert Johnson',
    purchasedate: '2024-01-08',
    branchId: 'branch-1',
    image: '',
    condition: 'Good'
  },
  {
    id: 'asset-006',
    name: 'Samsung 27" 4K Monitor',
    type: 'Monitor',
    serialnumber: 'SAM-MON-006',
    status: 'Available',
    assignedto: null,
    purchasedate: '2024-02-01',
    branchId: 'branch-2',
    image: '',
    condition: 'New'
  },
  {
    id: 'asset-007',
    name: 'iPhone 15 Pro',
    type: 'Mobile',
    serialnumber: 'IPHN-15P-007',
    status: 'Assigned',
    assignedto: 'Sarah Williams',
    purchasedate: '2024-01-20',
    branchId: 'branch-1',
    image: '',
    condition: 'Good'
  },
  {
    id: 'asset-008',
    name: 'Samsung Galaxy S24',
    type: 'Mobile',
    serialnumber: 'SAM-S24-008',
    status: 'Assigned',
    assignedto: 'Michael Brown',
    purchasedate: '2024-02-10',
    branchId: 'branch-2',
    image: '',
    condition: 'Good'
  },
  {
    id: 'asset-009',
    name: 'Canon Pixma Printer',
    type: 'Printer',
    serialnumber: 'CAN-PIX-009',
    status: 'Available',
    assignedto: null,
    purchasedate: '2023-10-15',
    branchId: 'branch-1',
    image: '',
    condition: 'Fair'
  },
  {
    id: 'asset-010',
    name: 'Logitech Mechanical Keyboard',
    type: 'Peripherals',
    serialnumber: 'LOG-KEY-010',
    status: 'Under Repair',
    assignedto: 'John Doe',
    purchasedate: '2023-09-01',
    branchId: 'branch-1',
    image: '',
    condition: 'Poor'
  },
  {
    id: 'asset-011',
    name: 'Cisco Network Switch',
    type: 'Network',
    serialnumber: 'CISCO-SW-011',
    status: 'Assigned',
    assignedto: 'IT Department',
    purchasedate: '2023-08-20',
    branchId: 'branch-1',
    image: '',
    condition: 'Good'
  },
  {
    id: 'asset-012',
    name: 'Microsoft Office 365 License',
    type: 'Software',
    serialnumber: 'MS-OFF-012',
    status: 'Available',
    assignedto: null,
    purchasedate: '2024-03-01',
    branchId: 'branch-1',
    image: '',
    condition: 'New'
  }
];


// const submittingRef = useRef(false);
const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-white/20 p-4 flex items-center justify-between">
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</p>
      <h3 className="text-xl font-bold text-slate-800 mt-1">{value}</h3>
    </div>
    <div className={`p-2.5 rounded-xl ${color} text-white shadow-sm`}>
      {icon}
    </div>
  </div>
);

const AssetManagement: React.FC<AssetManagementProps> = ({ user, assets, employees, branches, systemConfig, onAddAsset, onUpdateAsset, onDeleteAsset }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'assigned' | 'available' | 'repair'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  
  // Transfer Modal State
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferAsset, setTransferAsset] = useState<Asset | null>(null);
  const [transferTargetEmployeeId, setTransferTargetEmployeeId] = useState('');

  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
    const [formData, setFormData] = useState<Partial<Asset>>({
        name: '', type: 'Laptop', serialnumber: '', status: 'Available', condition: 'New', image: '', branchId: '', assignedto: ''
    });

    


  // Assign Modal State
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [assignBranchFilter, setAssignBranchFilter] = useState('');

  const isEmployee = user.role === 'employee';
  
  const itDeviceCategories = ['All Devices', 'Laptop', 'Desktop', 'Mobile', 'Monitor', 'Printer', 'Network', 'Peripherals', 'Software'];
  const assetCategories = systemConfig?.assetCategories && systemConfig.assetCategories.length > 0 
    ? systemConfig.assetCategories 
    : ['Laptop', 'Desktop', 'Mobile', 'Monitor', 'Printer', 'Network', 'Peripherals', 'Software'];
  
  const getIconType = (type: string) => {
    switch(type.toLowerCase()) {
        case 'laptop': return <Laptop size={16} />;
        case 'mobile': return <Smartphone size={16} />;
        case 'monitor': return <Monitor size={16} />;
        default: return <Mouse size={16} />;
    }
  };

  const filteredAssets = assets.filter(asset => {
    // Role-based Filtering
    if (isEmployee && asset.assignedto !== user.name) return false;

    // Tab Filtering
    if (activeTab === 'assigned' && asset.status !== 'Assigned') return false;
    if (activeTab === 'available' && asset.status !== 'Available') return false;
    if (activeTab === 'repair' && asset.status !== 'Under Repair') return false;

    // Category Filtering
    if (selectedCategory !== 'all' && asset.type !== selectedCategory) return false;

    return (
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      asset.serialnumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.assignedto?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const availableAssets = assets.filter(a => a.status === 'Available' && (!assignBranchFilter || a.branchId === assignBranchFilter));
  const filteredEmployeesForAssign = employees.filter(e => e.status === 'Active' && (!assignBranchFilter || e.branchId === assignBranchFilter));

  const handleEditClick = (asset: Asset) => {
      setEditingAsset(asset);
      setFormData(asset);
      setIsModalOpen(true);
  };

  const handleViewClick = (asset: Asset) => {
      setEditingAsset(asset);
      setIsViewModalOpen(true);
  };

  const handleAddClick = () => {
             //  Close all other modals first
            setIsViewModalOpen(false);
            setIsAssignModalOpen(false);
            setIsTransferModalOpen(false);
            setEditingAsset(null);
            setFormData({
                // id: editingAsset ? editingAsset.id : `asset-${Date.now()}`,
                name: '',
                type: assetCategories[0] || 'Laptop',
                serialnumber: '',
                status: 'Available',
                // condition: 'New',
                // image: '',
                branchId: branches[0]?.id || '',
                assignedto: ''
            });
            console.log('Add Asset clicked');

            setIsModalOpen(true);
  };

  const handleAssignClick = () => {
      setSelectedAssetId('');
      setSelectedEmployeeId('');
      setAssignBranchFilter('');
      setIsAssignModalOpen(true);
  };

  // Transfer Handlers
  const handleTransferClick = (asset: Asset) => {
      setTransferAsset(asset);
      setTransferTargetEmployeeId('');
      setIsTransferModalOpen(true);
  };

//   const handleTransferSubmit = (e: React.FormEvent) => {
//       e.preventDefault();
//       const targetEmp = employees.find(e => e.id === transferTargetEmployeeId);
//       if (transferAsset && targetEmp) {
//           onUpdateAsset({
//               ...transferAsset,
//               assignedTo: targetEmp.name,
//               // If moving to an employee in a different branch, update the asset's branch too
//               branchId: targetEmp.branchId || transferAsset.branchId 
//           });
//           setIsTransferModalOpen(false);
//           setTransferAsset(null);
//       }
//   };

const handleTransferSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const targetEmp = employees.find(e => e.id === transferTargetEmployeeId);
  if (!transferAsset || !targetEmp) return;

  //  STRIP conflicting fields
  const {
    assignedto,
    assignedTo,
    created_at,
    updated_at,
    branchid,
    branchId,
    ...safeAsset
  } = transferAsset as any;

  await onUpdateAsset({
    ...safeAsset,
    assignedto: targetEmp.name, // ✅ ONLY DB COLUMN
    branchid: targetEmp.branchid || transferAsset.branchid,
    status: 'Assigned'
  });

  setIsTransferModalOpen(false);
  setTransferAsset(null);
};


//  const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();

//   if (loading) return; // 🛑 prevent double submit
//   setLoading(true);
//   setError('');
//   setSuccess('');

//   if (!formData.name || !formData.serialnumber || !formData.type || !formData.branchId) {
//     setError('Please fill all required fields.');
//     setLoading(false);
//     return;
//   }

//   try {
//     const res = await fetch('http://localhost:3001/api/assets', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         id: editingAsset ? editingAsset.id : `asset-${Date.now()}`,
//         name: formData.name,
//         type: formData.type,
//         serialnumber: formData.serialnumber,
//         assignedto: formData.assignedto || null,
//         purchaseDate: new Date().toISOString().split('T')[0],
//         status: formData.status,
//         branchId: formData.branchId
//       })
//     });

//     if (!res.ok) {
//       const err = await res.json();
//       throw new Error(err.error || 'Failed to add asset');
//     }

//     const createdAsset = await res.json();

//     onAddAsset(createdAsset); // backend-generated ID
//     setSuccess('Asset added successfully!');
//     setIsModalOpen(false);

//     // 🔁 reset form after success
//     setFormData({
//       name: '',
//       type: systemConfig?.assetCategories?.[0] || 'Laptop',
//       serialNumber: '',
//       status: 'Available',
//       branchId: branches[0]?.id || '',
//       assignedto: ''
//     });

//   } catch (err: any) {
//     setError(err.message);
//   } finally {
//     setLoading(false);
//   }
// };


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!window.confirm(editingAsset ? 'Are you sure you want to update this asset?' : 'Are you sure you want to add this new asset?')) {
    return;
  }

  if (loading) return;
  setLoading(true);
  setError('');
  setSuccess('');

  if (!formData.name || !formData.serialnumber || !formData.type || !formData.branchId) {
    setError('Please fill all required fields.');
    setLoading(false);
    return;
  }

  try {
    const assetPayload: Asset = {
      id: editingAsset ? editingAsset.id : `asset-${Date.now()}`,
      name: formData.name,
      type: formData.type,
      serialnumber: formData.serialnumber,
      assignedto: formData.assignedto || null,
      purchasedate: new Date().toISOString().split('T')[0],
      status: formData.status || 'Available',
      branchId: formData.branchId,
    };

    // ✅ SINGLE source of truth
    await onAddAsset(assetPayload);

    setSuccess('Asset added successfully!');
    setIsModalOpen(false);

    setFormData({
      name: '',
      type: assetCategories[0] || 'Laptop',
      serialnumber: '',
      status: 'Available',
      branchId: branches[0]?.id || '',
      assignedto: ''
    });

  } catch (err: any) {
    setError(err.message || 'Failed to add asset');
  } finally {
    setLoading(false);
  }
};
  

// const handleAssignSubmit = (e: React.FormEvent) => {
//       e.preventDefault();
//       const assetToAssign = assets.find(a => a.id === selectedAssetId);
//       const employeeToAssign = employees.find(e => e.id === selectedEmployeeId);
      

//       if(assetToAssign && employeeToAssign) {
//           onUpdateAsset({
//               ...assetToAssign,
//               assignedto: employeeToAssign.name,
//               status: 'Assigned'
//           });
//           setIsAssignModalOpen(false);
//       }
//   };

const handleAssignSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!window.confirm('Are you sure you want to assign this asset to the selected employee?')) {
    return;
  }

  const assetToAssign = assets.find(a => a.id === selectedAssetId);
  const employeeToAssign = employees.find(e => e.id === selectedEmployeeId);

  if (!assetToAssign || !employeeToAssign) return;

  //  STRIP conflicting DB fields
  const {
    assignedto,
    // assignedTo,
    created_at,
    updated_at,
    ...safeAsset
  } = assetToAssign as any;

  await onUpdateAsset({
    ...safeAsset,
    assignedto: employeeToAssign.name, // ✅ ONLY THIS
    status: 'Assigned'
  });

  setIsAssignModalOpen(false);
};



  return (
    
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{isEmployee ? 'My Assets' : 'Asset Management'}</h1>
          <p className="text-slate-500 mt-1">{isEmployee ? 'View devices and equipment assigned to you.' : 'Track company devices, inventory, and assignments.'}</p>
        </div>
        {!isEmployee && (
            <div className="flex space-x-3">
                 <button 
                    onClick={handleAssignClick}
                    className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl flex items-center space-x-2 hover:bg-slate-50 transition-all font-medium shadow-sm"
                >
                    <Link size={18} />
                    <span>Assign Asset</span>
                </button>
                <button 
                    onClick={handleAddClick}
                    className="bg-accent-500 text-white px-4 py-2 rounded-xl flex items-center space-x-2 hover:bg-accent-600 shadow-lg shadow-orange-500/30 transition-all font-medium"
                >
                    <Plus size={18} />
                    <span>Add Asset</span>
                </button>
            </div>
        )}
      </div>

       {/* Stats Cards */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         <StatCard title="Total Assets" value={assets.length} icon={<Monitor size={20} />} color="bg-blue-500" />
         {!isEmployee && (
            <>
                <StatCard title="Assigned" value={assets.filter(a => a.status === 'Assigned').length} icon={<Laptop size={20} />} color="bg-orange-500" />
                <StatCard title="Available" value={assets.filter(a => a.status === 'Available').length} icon={<Smartphone size={20} />} color="bg-orange-500" />
                <StatCard title="Under Repair" value={assets.filter(a => a.status === 'Under Repair').length} icon={<Monitor size={20} />} color="bg-red-500" />
            </>
         )}
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-white/20 overflow-hidden">
        {/* Tab Switcher */}
        {!isEmployee && (
            <div className="border-b border-slate-100 p-2 bg-slate-50/50">
                 <div className="flex items-center space-x-1 overflow-x-auto">
                     <button onClick={() => setActiveTab('all')} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'all' ? 'bg-white shadow-sm text-accent-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>All Assets</button>
                     <button onClick={() => setActiveTab('assigned')} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'assigned' ? 'bg-white shadow-sm text-accent-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>Assigned</button>
                     <button onClick={() => setActiveTab('available')} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'available' ? 'bg-white shadow-sm text-accent-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>Available</button>
                     <button onClick={() => setActiveTab('repair')} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'repair' ? 'bg-white shadow-sm text-accent-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>In Repair</button>
                </div>
            </div>
        )}

        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 bg-white/50">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search assets by name, serial..." 
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 text-sm transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            {!isEmployee && (
                <div className="flex gap-2">
                    <select 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors bg-white focus:outline-none focus:ring-2 focus:ring-accent-500/50"
                    >
                        {itDeviceCategories.map(cat => (
                            <option key={cat} value={cat === 'All Devices' ? 'all' : cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                    <button className="flex items-center space-x-2 px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                        <Filter size={16} />
                        <span>Filter</span>
                    </button>
                </div>
            )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Asset Name</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Serial Number</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                {!isEmployee && <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned To</th>}
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssets.map(asset => (
                <tr key={asset.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 overflow-hidden">
                            {asset.image ? <img src={asset.image} alt="" className="w-full h-full object-cover"/> : <ImageIcon size={20}/>}
                        </div>
                        <div>
                            <span className="font-semibold text-slate-800 text-sm block">{asset.name}</span>
                            <span className="text-xs text-slate-400">Purchased: {asset.purchasedate}</span>
                        </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600 font-mono">{asset.serialnumber}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2 text-slate-600 text-sm">
                        {getIconType(asset.type)}
                        <span>{asset.type}</span>
                    </div>
                  </td>
                  {!isEmployee && (
                    <td className="p-4 text-sm text-slate-600">
                        {asset.assignedto ? (
                            <span className="text-slate-800 font-medium">{asset.assignedto}</span>
                        ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                        )}
                    </td>
                  )}
                  <td className="p-4">
                     <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
                        asset.status === 'Available' ? 'bg-orange-100 text-orange-700 border-orange-200' : 
                        asset.status === 'Assigned' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        asset.status === 'Under Repair' ? 'bg-red-100 text-red-700 border-red-200' :
                        'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                        {asset.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => handleViewClick(asset)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View"><Eye size={16} /></button>
                        {!isEmployee && (
                            <>
                                {asset.status === 'Assigned' && (
                                    <button onClick={() => handleTransferClick(asset)} className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Transfer Asset"><ArrowRightLeft size={16} /></button>
                                )}
                                <button onClick={() => handleEditClick(asset)} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors" title="Edit"><Edit size={16} /></button>
                                <button onClick={() => { if (window.confirm('Are you sure you want to delete this asset? This action cannot be undone.')) { onDeleteAsset(asset.id); } }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={16} /></button>
                            </>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAssets.length === 0 && (
              <div className="p-8 text-center text-slate-400 italic">No assets found.</div>
          )}
        </div>
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800 text-lg">{editingAsset ? 'Edit Asset' : 'Add New Asset'}</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name</label>
                        <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/50" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/50">
                            {assetCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                        <select value={formData.branchId || ''} onChange={e => setFormData({...formData, branchId: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/50">
                            <option value="">Select Branch</option>
                            {branches.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                        <input value={formData.serialnumber} onChange={e => setFormData({...formData, serialnumber: e.target.value})} type="text" className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/50" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/50">
                                <option>Available</option>
                                <option>Assigned</option>
                                <option>Under Repair</option>
                                <option>Retired</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                            <select value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value as any})} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/50">
                                <option>New</option>
                                <option>Good</option>
                                <option>Fair</option>
                                <option>Poor</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assign To Employee</label>
                        <select value={formData.assignedto || ''} onChange={e => setFormData({...formData, assignedto: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/50">
                            <option value="">Unassigned</option>
                            {employees.filter(e => e.status === 'Active').map(emp => (
                                <option key={emp.id} value={emp.name}>{emp.name} ({emp.department})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Asset Photo</label>
                        <input type="file" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-accent-50 file:text-accent-700 hover:file:bg-accent-100" />
                    </div>
                    <button type="submit" className="w-full bg-accent-500 text-white py-2.5 rounded-xl font-medium hover:bg-accent-600 transition-colors shadow-lg shadow-orange-500/30">
                        {editingAsset ? 'Save Changes' : 'Add Asset'}
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* Assignment Modal - Top Level */}
      {isAssignModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800 text-lg">Assign Asset</h3>
                    <button onClick={() => setIsAssignModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                </div>
                <div className="p-6 space-y-6">
                    <form onSubmit={handleAssignSubmit} className="space-y-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Branch</label>
                            <select 
                                value={assignBranchFilter} 
                                onChange={e => setAssignBranchFilter(e.target.value)} 
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/50"
                            >
                                <option value="">All Branches</option>
                                {branches.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>

                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Asset (Available)</label>
                            <select 
                                value={selectedAssetId} 
                                onChange={e => setSelectedAssetId(e.target.value)} 
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/50"
                                required
                            >
                                <option value="">-- Choose Asset --</option>
                                {availableAssets.map(asset => (
                                    <option key={asset.id} value={asset.id}>{asset.name} - {asset.serialnumber}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Assign To Employee</label>
                            <select 
                                value={selectedEmployeeId} 
                                onChange={e => setSelectedEmployeeId(e.target.value)} 
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/50"
                                required
                            >
                                <option value="">-- Choose Employee --</option>
                                {filteredEmployeesForAssign.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.department})</option>
                                ))}
                            </select>
                        </div>

                         {/* Preview Selection */}
                        {selectedAssetId && selectedEmployeeId && (
                             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                                 <div className="text-sm">
                                     <p className="text-slate-500">Asset</p>
                                     <p className="font-semibold text-slate-800">{assets.find(a => a.id === selectedAssetId)?.name}</p>
                                 </div>
                                 <ArrowRight size={20} className="text-slate-400" />
                                 <div className="text-sm text-right">
                                     <p className="text-slate-500">Employee</p>
                                     <p className="font-semibold text-slate-800">{employees.find(e => e.id === selectedEmployeeId)?.name}</p>
                                 </div>
                             </div>
                        )}

                        <button type="submit" className="w-full bg-accent-500 text-white py-2.5 rounded-xl font-medium hover:bg-accent-600 transition-colors shadow-lg shadow-orange-500/30" disabled={!selectedAssetId || !selectedEmployeeId}>
                            Confirm Assignment
                        </button>
                    </form>
                </div>
            </div>
          </div>
      )}

      {/* Transfer Modal (NEW) */}
      {isTransferModalOpen && transferAsset && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800 text-lg">Transfer Asset</h3>
                    <button onClick={() => setIsTransferModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-center justify-between mb-4">
                        <div>
                            <p className="text-xs text-orange-600 font-bold uppercase">Current Holder</p>
                            <p className="font-semibold text-slate-800">{transferAsset.assignedTo}</p>
                        </div>
                        <ArrowRight size={20} className="text-orange-400" />
                    </div>

                    <form onSubmit={handleTransferSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Transfer To</label>
                            <select 
                                value={transferTargetEmployeeId} 
                                onChange={e => setTransferTargetEmployeeId(e.target.value)} 
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/50"
                                required
                            >
                                <option value="">-- Select New Employee --</option>
                                {employees.filter(e => e.status === 'Active' && e.name !== transferAsset.assignedTo).map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.department} - {emp.branchId === transferAsset.branchId ? 'Same Branch' : 'Other Branch'})</option>
                                ))}
                            </select>
                        </div>

                        <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <p className="flex items-center"><Monitor size={14} className="mr-2"/> Transferring: <span className="font-semibold ml-1 text-slate-700">{transferAsset.name}</span></p>
                            <p className="flex items-center mt-1"><Link size={14} className="mr-2"/> Serial: <span className="font-mono ml-1 text-slate-700">{transferAsset.serialNumber}</span></p>
                        </div>

                        <button type="submit" className="w-full bg-orange-500 text-white py-2.5 rounded-xl font-medium hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30" disabled={!transferTargetEmployeeId}>
                            Confirm Transfer
                        </button>
                    </form>
                </div>
            </div>
          </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && editingAsset && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-gray-800 text-lg">Asset Details</h3>
                        <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                  </div>
                  <div className="p-6 space-y-4">
                       <div className="flex justify-center mb-4">
                           {editingAsset.image ? (
                               <img src={editingAsset.image} alt={editingAsset.name} className="w-32 h-32 object-cover rounded-xl border border-slate-200 shadow-sm" />
                           ) : (
                               <div className="w-32 h-32 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400">
                                   <ImageIcon size={48} />
                               </div>
                           )}
                       </div>
                       <div className="flex items-center space-x-3 mb-2 justify-center">
                           <div className="p-2 bg-accent-50 rounded-lg text-accent-500">
                               {getIconType(editingAsset.type)}
                           </div>
                           <h4 className="text-xl font-bold text-slate-800">{editingAsset.name}</h4>
                       </div>
                       <div className="text-center text-slate-500 text-sm mb-4 font-mono">{editingAsset.serialnumber}</div>
                       
                       <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                           <div>
                               <p className="text-xs text-slate-400 uppercase font-bold">Assigned To</p>
                               <p className="text-slate-800 font-medium">{editingAsset.assignedto || 'Unassigned'}</p>
                           </div>
                           <div>
                               <p className="text-xs text-slate-400 uppercase font-bold">Status</p>
                               <span className={`px-2 py-0.5 text-xs font-medium rounded-full border inline-block mt-1 ${
                                   editingAsset.status === 'Available' ? 'bg-orange-100 text-orange-700 border-orange-200' : 
                                   editingAsset.status === 'Assigned' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                   'bg-red-100 text-red-700 border-red-200'
                               }`}>
                                   {editingAsset.status}
                               </span>
                           </div>
                           <div>
                               <p className="text-xs text-slate-400 uppercase font-bold">Purchase Date</p>
                               <p className="text-slate-600">{editingAsset.purchasedate}</p>
                           </div>
                           <div>
                               <p className="text-xs text-slate-400 uppercase font-bold">Type</p>
                               <p className="text-slate-600">{editingAsset.type}</p>
                           </div>
                       </div>
                  </div>
                  <div className="p-4 bg-gray-50 flex justify-end">
                      <button onClick={() => setIsViewModalOpen(false)} className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-slate-600 hover:bg-slate-50 text-sm font-medium">Close</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AssetManagement;
