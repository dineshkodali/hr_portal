/**
 * Copyright (c) 2026 SD Commercial. All rights reserved.
 * This file and its contents are proprietary to SD Commercial.
 * Unauthorized copying, distribution, or use is strictly prohibited.
 */

import React, { useState } from 'react';

const defaultCopyrightText = `
SD Commercial Employee Management Portal

Copyright (c) 2026 SD Commercial. All rights reserved.

This application and its source code are proprietary to SD Commercial. Unauthorized copying, distribution, modification, or use of any part of this software is strictly prohibited and may result in legal action.

All content, data, and intellectual property within this portal, including but not limited to:
- Source code (frontend, backend, scripts)
- Database schema and data
- UI/UX designs and assets
- Documentation and internal policies
- Employee, HR, and company records
are the exclusive property of SD Commercial.

For permissions, licensing, or legal inquiries, please contact:
legal@sdcommercial.com

SD Commercial reserves all rights to update, modify, or restrict access to this portal at any time.
`;

const CopyrightPage: React.FC = () => {
  // Simulate admin check (replace with real logic if available)
  const isAdmin = true;
  const [editing, setEditing] = useState(false);
  const [copyrightText, setCopyrightText] = useState(defaultCopyrightText);

  return (
    <div className="w-[90%] mx-auto p-8 bg-white rounded-2xl shadow-lg border border-[#f1f5f9] mt-10">
      <h1 className="text-3xl font-bold text-[#1e293b] mb-6">Copyright & Ownership Notice</h1>
      {editing ? (
        <textarea
          className="whitespace-pre-wrap text-[#475569] text-base leading-relaxed bg-[#f8fafc] p-6 rounded-xl border border-[#e2e8f0] w-full min-h-[300px]"
          value={copyrightText}
          onChange={e => setCopyrightText(e.target.value)}
        />
      ) : (
        <pre className="whitespace-pre-wrap text-[#475569] text-base leading-relaxed bg-[#f8fafc] p-6 rounded-xl border border-[#e2e8f0]">
          {copyrightText}
        </pre>
      )}
      {isAdmin && (
        <div className="mt-6 flex justify-end">
          <button
            className={`px-4 py-2 rounded-lg font-bold text-white ${editing ? 'bg-orange-600 hover:bg-orange-700' : 'bg-orange-500 hover:bg-orange-600'} transition-all`}
            onClick={() => setEditing(editing ? false : true)}
          >
            {editing ? 'Save' : 'Edit'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CopyrightPage;
