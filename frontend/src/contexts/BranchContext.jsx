import React, { createContext, useContext, useState, useEffect } from 'react';

const BranchContext = createContext();

export const useBranch = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
};

export const BranchProvider = ({ children }) => {
  const [selectedBranch, setSelectedBranch] = useState(() => {
    return localStorage.getItem('selectedBranch') || 'All Branches';
  });
  
  const [adminRole, setAdminRole] = useState(() => {
    return localStorage.getItem('adminRole') || 'admin';
  });

  const [adminBranch, setAdminBranch] = useState(() => {
    return localStorage.getItem('adminBranch') || 'Main Branch';
  });

  const branches = [
    'All Branches',
    'Main Branch',
    'Downtown Branch',
    'West Branch',
    'East Branch',
    'Tech Center'
  ];

  const updateSelectedBranch = (branch) => {
    setSelectedBranch(branch);
    localStorage.setItem('selectedBranch', branch);
  };

  // Listen for localStorage changes (useful when multiple tabs are open)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'selectedBranch') {
        setSelectedBranch(e.newValue || 'All Branches');
      }
      if (e.key === 'adminRole') {
        setAdminRole(e.newValue || 'admin');
      }
      if (e.key === 'adminBranch') {
        setAdminBranch(e.newValue || 'Main Branch');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value = {
    selectedBranch,
    adminRole,
    adminBranch,
    branches,
    updateSelectedBranch,
    isSuperAdmin: adminRole === 'superadmin',
    getEffectiveBranch: () => {
      return adminRole === 'superadmin' ? selectedBranch : adminBranch;
    }
  };

  return (
    <BranchContext.Provider value={value}>
      {children}
    </BranchContext.Provider>
  );
};

export default BranchContext;