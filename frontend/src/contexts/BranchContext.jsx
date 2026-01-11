import React, { createContext, useContext, useState, useEffect } from 'react';
import branchService from '../services/branchService';

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

  const [branches, setBranches] = useState(['All Branches']);
  const [loading, setLoading] = useState(false);

  // Fetch branches based on tenant ID
  useEffect(() => {
    const fetchBranches = async () => {
      const tenantId = localStorage.getItem('tenantId');
      if (!tenantId) {
        // Fallback to hardcoded branches if no tenantId (backward compatibility)
        setBranches([
          'All Branches',
          'Main Branch',
          'Downtown Branch',
          'West Branch',
          'East Branch',
          'Tech Center'
        ]);
        return;
      }

      try {
        setLoading(true);
        const fetchedBranches = await branchService.getBranchesByTenant(parseInt(tenantId));
        const branchNames = fetchedBranches.map(b => b.name);
        
        // Add "All Branches" option for super admins
        const allBranches = adminRole === 'superadmin' 
          ? ['All Branches', ...branchNames]
          : branchNames;
        
        setBranches(allBranches);
        
        // Update selected branch if current selection is not in the list
        if (!allBranches.includes(selectedBranch)) {
          const newBranch = adminRole === 'superadmin' ? 'All Branches' : (branchNames[0] || adminBranch);
          setSelectedBranch(newBranch);
          localStorage.setItem('selectedBranch', newBranch);
        }
      } catch (error) {
        console.error('Error fetching branches:', error);
        // Fallback to admin branch on error
        setBranches([adminBranch]);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, [adminRole]); // Re-fetch when admin role changes

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
    loading,
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