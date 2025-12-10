import { useEffect, useState, Fragment } from "react";
import axios from "@/auth/_helpers";
import { toast } from "sonner";
import { Container } from "@/components/container";
import { KeenIcon } from "@/components";
import { Toolbar, ToolbarHeading, ToolbarPageTitle } from "@/partials/toolbar";

enum AdminRoles {
  SUPER = "super",
  DISPATCH = "dispatch",
  SUPPORT = "support"
}

interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  role: string;
}

const AdminPage = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/dev/api/v1/admin");
      // Filter only dispatch and support
      const filtered = response.data.data.filter((admin: AdminUser) => 
        admin.role === AdminRoles.DISPATCH || admin.role === AdminRoles.SUPPORT
      );
      setAdmins(filtered);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;
    
    try {
      await axios.patch(`/dev/api/v1/admin/${editingAdmin.id}`, {
        role: editingAdmin.role,
        status: editingAdmin.status
      });
      toast.success("Admin updated successfully");
      setIsModalOpen(false);
      fetchAdmins();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update admin");
    }
  };

  return (
    <Fragment>
      <Container>
        <Toolbar>
           <ToolbarHeading>
             <ToolbarPageTitle />
           </ToolbarHeading>
        </Toolbar>
        
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">Admins</h3>
            </div>
            <div className="card-table scrollable-x-auto">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="text-center p-4">Loading...</td></tr>
                        ) : admins.length === 0 ? (
                            <tr><td colSpan={5} className="text-center p-4">No admins found</td></tr>
                        ) : admins.map(admin => (
                            <tr key={admin.id}>
                                <td>{admin.firstName} {admin.lastName}</td>
                                <td>{admin.email}</td>
                                <td>
                                    <span className="badge badge-light-primary">{admin.role}</span>
                                </td>
                                <td>
                                    <span className={`badge badge-${admin.status === 'active' ? 'success' : 'danger'}`}>
                                        {admin.status}
                                    </span>
                                </td>
                                <td>
                                    <button className="btn btn-sm btn-light btn-active-light-primary" onClick={() => {
                                        setEditingAdmin(admin);
                                        setIsModalOpen(true);
                                    }}>
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {isModalOpen && editingAdmin && (
             <div className="modal fade show block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Edit Admin</h5>
                            <button className="btn btn-icon btn-sm btn-active-light-primary ms-2" onClick={() => setIsModalOpen(false)}>
                                <KeenIcon icon="cross" className="fs-2" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdate}>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Role</label>
                                    <select 
                                        className="form-select" 
                                        value={editingAdmin.role}
                                        onChange={e => setEditingAdmin({...editingAdmin, role: e.target.value})}
                                    >
                                        <option value={AdminRoles.DISPATCH}>Dispatch</option>
                                        <option value={AdminRoles.SUPPORT}>Support</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Status</label>
                                    <select 
                                        className="form-select" 
                                        value={editingAdmin.status}
                                        onChange={e => setEditingAdmin({...editingAdmin, status: e.target.value})}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-light" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save changes</button>
                            </div>
                        </form>
                    </div>
                </div>
             </div>
        )}
      </Container>
    </Fragment>
  );
};

export { AdminPage };
