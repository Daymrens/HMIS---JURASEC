import { useState, useEffect } from 'react';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

const availablePermissions: Permission[] = [
  // POS Permissions
  { id: 'pos.view', name: 'View POS', description: 'Access POS interface', category: 'POS' },
  { id: 'pos.sell', name: 'Process Sales', description: 'Complete transactions', category: 'POS' },
  { id: 'pos.discount', name: 'Apply Discounts', description: 'Add discounts to sales', category: 'POS' },
  { id: 'pos.refund', name: 'Process Refunds', description: 'Handle returns and refunds', category: 'POS' },
  { id: 'pos.void', name: 'Void Transactions', description: 'Cancel completed sales', category: 'POS' },
  
  // Inventory Permissions
  { id: 'inventory.view', name: 'View Inventory', description: 'See product list', category: 'Inventory' },
  { id: 'inventory.create', name: 'Add Products', description: 'Create new products', category: 'Inventory' },
  { id: 'inventory.edit', name: 'Edit Products', description: 'Modify product details', category: 'Inventory' },
  { id: 'inventory.delete', name: 'Delete Products', description: 'Remove products', category: 'Inventory' },
  { id: 'inventory.adjust', name: 'Adjust Stock', description: 'Modify stock levels', category: 'Inventory' },
  
  // Customer Permissions
  { id: 'customers.view', name: 'View Customers', description: 'See customer list', category: 'Customers' },
  { id: 'customers.create', name: 'Add Customers', description: 'Create new customers', category: 'Customers' },
  { id: 'customers.edit', name: 'Edit Customers', description: 'Modify customer details', category: 'Customers' },
  { id: 'customers.delete', name: 'Delete Customers', description: 'Remove customers', category: 'Customers' },
  { id: 'customers.credit', name: 'Manage Credit', description: 'Handle credit sales', category: 'Customers' },
  
  // Reports Permissions
  { id: 'reports.view', name: 'View Reports', description: 'Access reports', category: 'Reports' },
  { id: 'reports.export', name: 'Export Reports', description: 'Download reports', category: 'Reports' },
  { id: 'reports.financial', name: 'Financial Reports', description: 'View financial data', category: 'Reports' },
  
  // Settings Permissions
  { id: 'settings.view', name: 'View Settings', description: 'Access settings', category: 'Settings' },
  { id: 'settings.edit', name: 'Edit Settings', description: 'Modify system settings', category: 'Settings' },
  { id: 'settings.users', name: 'Manage Users', description: 'Add/edit/delete users', category: 'Settings' },
  { id: 'settings.backup', name: 'Backup/Restore', description: 'Manage backups', category: 'Settings' },
];

const defaultRoles: Role[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access',
    permissions: availablePermissions.map(p => p.id),
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Manage operations and view reports',
    permissions: [
      'pos.view', 'pos.sell', 'pos.discount', 'pos.refund',
      'inventory.view', 'inventory.create', 'inventory.edit', 'inventory.adjust',
      'customers.view', 'customers.create', 'customers.edit', 'customers.credit',
      'reports.view', 'reports.export', 'reports.financial',
      'settings.view',
    ],
  },
  {
    id: 'cashier',
    name: 'Cashier',
    description: 'Process sales only',
    permissions: [
      'pos.view', 'pos.sell',
      'inventory.view',
      'customers.view',
    ],
  },
  {
    id: 'stock_clerk',
    name: 'Stock Clerk',
    description: 'Manage inventory',
    permissions: [
      'inventory.view', 'inventory.create', 'inventory.edit', 'inventory.adjust',
      'customers.view',
    ],
  },
];

export default function PermissionSystem() {
  const [roles, setRoles] = useState<Role[]>(defaultRoles);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  useEffect(() => {
    const saved = localStorage.getItem('user_roles');
    if (saved) {
      setRoles(JSON.parse(saved));
    }
  }, []);

  const saveRoles = (updatedRoles: Role[]) => {
    setRoles(updatedRoles);
    localStorage.setItem('user_roles', JSON.stringify(updatedRoles));
  };

  const createRole = () => {
    if (!roleForm.name) {
      alert('Please enter role name');
      return;
    }

    const newRole: Role = {
      id: roleForm.name.toLowerCase().replace(/\s+/g, '_'),
      name: roleForm.name,
      description: roleForm.description,
      permissions: roleForm.permissions,
    };

    saveRoles([...roles, newRole]);
    setShowRoleForm(false);
    setRoleForm({ name: '', description: '', permissions: [] });
  };

  const updateRole = (roleId: string, permissions: string[]) => {
    const updated = roles.map(r =>
      r.id === roleId ? { ...r, permissions } : r
    );
    saveRoles(updated);
  };

  const deleteRole = (roleId: string) => {
    if (['admin', 'manager', 'cashier'].includes(roleId)) {
      alert('Cannot delete default roles');
      return;
    }
    if (!confirm('Delete this role?')) return;
    saveRoles(roles.filter(r => r.id !== roleId));
  };

  const togglePermission = (roleId: string, permissionId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;

    const hasPermission = role.permissions.includes(permissionId);
    const newPermissions = hasPermission
      ? role.permissions.filter(p => p !== permissionId)
      : [...role.permissions, permissionId];

    updateRole(roleId, newPermissions);
  };

  const groupedPermissions = availablePermissions.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Permission System</h3>
        <button onClick={() => setShowRoleForm(true)} className="btn btn-primary">
          + Create Role
        </button>
      </div>

      {/* Roles List */}
      <div className="grid grid-cols-2 gap-4">
        {roles.map((role) => (
          <div
            key={role.id}
            className={`card cursor-pointer transition-all ${
              selectedRole?.id === role.id
                ? 'border-2 border-accent shadow-lg'
                : 'border-2 border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedRole(role)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold">{role.name}</h4>
                <p className="text-sm text-gray-600">{role.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {role.permissions.length} permissions
                </p>
              </div>
              {!['admin', 'manager', 'cashier', 'stock_clerk'].includes(role.id) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteRole(role.id);
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Permission Matrix */}
      {selectedRole && (
        <div className="card">
          <h4 className="font-semibold mb-4">
            Permissions for {selectedRole.name}
          </h4>

          {Object.entries(groupedPermissions).map(([category, permissions]) => (
            <div key={category} className="mb-6">
              <h5 className="font-semibold text-sm text-gray-700 mb-3 border-b pb-2">
                {category}
              </h5>
              <div className="space-y-2">
                {permissions.map((permission) => (
                  <label
                    key={permission.id}
                    className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRole.permissions.includes(permission.id)}
                      onChange={() => togglePermission(selectedRole.id, permission.id)}
                      className="w-5 h-5 mt-0.5"
                      disabled={selectedRole.id === 'admin'}
                    />
                    <div>
                      <p className="font-medium">{permission.name}</p>
                      <p className="text-sm text-gray-600">{permission.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {selectedRole.id === 'admin' && (
            <div className="bg-blue-50 p-3 rounded-lg text-sm text-gray-600">
              ℹ️ Administrator role has all permissions and cannot be modified.
            </div>
          )}
        </div>
      )}

      {/* Create Role Modal */}
      {showRoleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Create Role</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Role Name *</label>
                <input
                  type="text"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  className="input"
                  placeholder="e.g., Sales Associate"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  className="input"
                  rows={3}
                  placeholder="Brief description of this role..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Initial Permissions (can be modified later)
                </label>
                <div className="max-h-48 overflow-y-auto border rounded p-3 space-y-2">
                  {availablePermissions.slice(0, 10).map((perm) => (
                    <label key={perm.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={roleForm.permissions.includes(perm.id)}
                        onChange={(e) => {
                          const newPerms = e.target.checked
                            ? [...roleForm.permissions, perm.id]
                            : roleForm.permissions.filter(p => p !== perm.id);
                          setRoleForm({ ...roleForm, permissions: newPerms });
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{perm.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRoleForm(false);
                  setRoleForm({ name: '', description: '', permissions: [] });
                }}
                className="flex-1 btn btn-secondary"
              >
                Cancel
              </button>
              <button onClick={createRole} className="flex-1 btn btn-primary">
                Create Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="card bg-yellow-50">
        <h4 className="font-semibold mb-2">💡 How to Use</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Click on a role to view and edit its permissions</li>
          <li>• Create custom roles for specific job functions</li>
          <li>• Assign roles to users in the Users page</li>
          <li>• Default roles (Admin, Manager, Cashier) cannot be deleted</li>
        </ul>
      </div>
    </div>
  );
}

// Utility function to check permissions
export const hasPermission = (userRole: string, permission: string): boolean => {
  const roles = JSON.parse(localStorage.getItem('user_roles') || '[]');
  const role = roles.find((r: Role) => r.id === userRole);
  return role ? role.permissions.includes(permission) : false;
};
