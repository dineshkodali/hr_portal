
import React, { useState } from 'react';
import { Folder, FileText, Image, Upload, MoreHorizontal, Download, Trash2, Search, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { api } from '../services/api';
import { StatCardProps, User, FileItem } from '../types';

interface FileManagerProps {
    user: User;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-white/20 p-4 flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${color} text-white shadow-md`}>
        {icon}
      </div>
    </div>
  );

const FileManager: React.FC<FileManagerProps> = ({ user }) => {
  const [activeCategory, setActiveCategory] = useState<'company' | 'personal'>('company');
  const [activeType, setActiveType] = useState<'all' | 'docs' | 'images'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const isAdmin = user.role === 'admin' || user.role === 'super_admin' || user.role === 'hr';

    const [files, setFiles] = React.useState<FileItem[]>([]);

    React.useEffect(() => {
        let mounted = true;
        api.get('files').then(res => { if (mounted) setFiles(res); }).catch(() => { if (mounted) setFiles([]); });
        return () => { mounted = false; };
    }, []);

    // Filter logic for environment
    const filteredFiles = files.filter(file => {
      const matchCategory = file.category.toLowerCase() === activeCategory;
      const matchSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
      let matchType = true;
      if (activeType === 'docs') matchType = ['pdf', 'doc', 'xls'].includes(file.type);
      if (activeType === 'images') matchType = ['img', 'png', 'jpg', 'jpeg'].includes(file.type);

      // Access Isolation
      let hasAccess = false;
      if (isAdmin) {
          hasAccess = true; // Admins see everything
      } else {
          // Employees see Company files or their OWN Personal files
          if (activeCategory === 'company') hasAccess = true;
          else hasAccess = file.ownerId === user.id || file.uploadedBy === user.name;
      }

      return matchCategory && matchSearch && matchType && hasAccess;
  }).sort((a, b) => {
    if (!sortConfig) return 0;
    const aValue = a[sortConfig.key as keyof typeof a];
    const bValue = b[sortConfig.key as keyof typeof b];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
    }
    return 0;
  });

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (name: string) => {
    if (!sortConfig || sortConfig.key !== name) {
        return <div className="ml-1 text-slate-400 opacity-0 group-hover:opacity-50 transition-opacity"><ChevronDown size={14}/></div>;
    }
    return sortConfig.direction === 'asc' 
        ? <ChevronUp size={14} className="ml-1 text-accent-500"/> 
        : <ChevronDown size={14} className="ml-1 text-accent-500"/>;
  };

    const getFileIcon = (type: string) => {
    switch (type) {
        case 'pdf': return <FileText size={24} className="text-red-500" />;
        case 'doc': return <FileText size={24} className="text-blue-500" />;
        case 'xls': return <FileText size={24} className="text-orange-500" />;
        case 'img': case 'png': case 'jpg': case 'jpeg': return <Image size={24} className="text-purple-500" />;
        default: return <Folder size={24} className="text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">File Manager</h1>
          <p className="text-gray-500 mt-1">
              {isAdmin ? 'System-wide document control and oversight.' : 'Access company resources and manage your personal files.'}
          </p>
        </div>
        <button className="bg-accent-500 text-white px-4 py-2 rounded-xl flex items-center space-x-2 hover:bg-accent-600 shadow-lg shadow-orange-500/30 transition-all font-medium">
            <Upload size={18} />
            <span>Upload File</span>
        </button>
      </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         <StatCard title="Total Storage" value="45 GB" icon={<Folder size={20} />} color="bg-blue-500" />
         <StatCard title="Used Space" value="12.4 GB" icon={<Folder size={20} />} color="bg-orange-500" />
         <StatCard title="Company Docs" value="1,205" icon={<FileText size={20} />} color="bg-purple-500" />
         <StatCard title="Isolated Files" value={filteredFiles.length.toString()} icon={<Lock size={20} />} color="bg-orange-500" />
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-white/20 overflow-hidden">
        <div className="border-b border-slate-100 p-2 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
             <div className="flex items-center space-x-1">
                 <button 
                    onClick={() => setActiveCategory('company')}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeCategory === 'company' ? 'bg-white shadow-sm text-accent-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                 >
                    Organization Vault
                 </button>
                 <button 
                    onClick={() => setActiveCategory('personal')}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeCategory === 'personal' ? 'bg-white shadow-sm text-accent-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                 >
                    {isAdmin ? 'All User Files' : 'Private Storage'}
                 </button>
            </div>
            
             <div className="relative max-w-sm w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder={`Search ${activeCategory} files...`}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 text-sm transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
        
        <div className="px-4 py-2 bg-white/50 border-b border-slate-100 flex space-x-4">
            <button onClick={() => setActiveType('all')} className={`text-[10px] font-black uppercase tracking-widest ${activeType === 'all' ? 'text-accent-600' : 'text-slate-400 hover:text-slate-600'}`}>All Formats</button>
            <button onClick={() => setActiveType('docs')} className={`text-[10px] font-black uppercase tracking-widest ${activeType === 'docs' ? 'text-accent-600' : 'text-slate-400 hover:text-slate-600'}`}>Documents</button>
            <button onClick={() => setActiveType('images')} className={`text-[10px] font-black uppercase tracking-widest ${activeType === 'images' ? 'text-accent-600' : 'text-slate-400 hover:text-slate-600'}`}>Media</button>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="p-4 cursor-pointer hover:bg-slate-50 group" onClick={() => requestSort('name')}>
                            <div className="flex items-center">Filename {getSortIcon('name')}</div>
                        </th>
                        <th className="p-4 cursor-pointer hover:bg-slate-50 group" onClick={() => requestSort('size')}>
                            <div className="flex items-center">Size {getSortIcon('size')}</div>
                        </th>
                        <th className="p-4 cursor-pointer hover:bg-slate-50 group" onClick={() => requestSort('uploadedBy')}>
                             <div className="flex items-center">Owner {getSortIcon('uploadedBy')}</div>
                        </th>
                        <th className="p-4 cursor-pointer hover:bg-slate-50 group" onClick={() => requestSort('uploadedDate')}>
                             <div className="flex items-center">Modified {getSortIcon('uploadedDate')}</div>
                        </th>
                        <th className="p-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredFiles.map(file => (
                        <tr key={file.id} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="p-4">
                                <div className="flex items-center space-x-3">
                                    {getFileIcon(file.type)}
                                    <span className="font-bold text-gray-800 text-sm">{file.name}</span>
                                </div>
                            </td>
                            <td className="p-4 text-sm text-slate-600">{file.size}</td>
                            <td className="p-4 text-sm text-slate-600 font-medium">{file.uploadedBy}</td>
                            <td className="p-4 text-sm text-slate-600">{file.uploadedDate}</td>
                            <td className="p-4 text-right">
                                <div className="flex items-center justify-end space-x-2">
                                    <button className="p-2 text-slate-400 hover:text-accent-600 hover:bg-orange-50 rounded-lg transition-colors" title="Download">
                                        <Download size={16} />
                                    </button>
                                    {(activeCategory === 'personal' || isAdmin) && (
                                         <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                    <button className="p-2 text-slate-300 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {filteredFiles.length === 0 && (
                <div className="p-20 text-center flex flex-col items-center">
                    <Folder size={48} className="text-slate-200 mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Environment is currently empty</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default FileManager;
