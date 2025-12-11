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
  const [filteredAdmins, setFilteredAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/dev/api/v1/admin");
      // Filter only dispatch and support
      const filtered = response.data.data.filter((admin: AdminUser) => 
        admin.role === AdminRoles.DISPATCH || admin.role === AdminRoles.SUPPORT
      );
      setAdmins(filtered);
      setFilteredAdmins(filtered);
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

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredAdmins(admins);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = admins.filter(admin => 
        admin.firstName?.toLowerCase().includes(query) ||
        admin.lastName?.toLowerCase().includes(query) ||
        admin.email?.toLowerCase().includes(query) ||
        admin.role?.toLowerCase().includes(query)
      );
      setFilteredAdmins(filtered);
    }
  }, [searchQuery, admins]);

  const handleStatusUpdate = async (adminId: string, newStatus: string) => {
    try {
      await axios.patch(`/dev/api/v1/admin/${adminId}`, {
        status: newStatus
      });
      toast.success("Status updated successfully");
      fetchAdmins();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  const handleRoleUpdate = async (adminId: string, newRole: string) => {
    try {
      await axios.patch(`/dev/api/v1/admin/${adminId}`, {
        role: newRole
      });
      toast.success("Role updated successfully");
      fetchAdmins();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update role");
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
            <div className="card-header gap-2">
                <h3 className="card-title">Admin Management</h3>
                <div className="flex items-center gap-2 flex-1 justify-end">
                  <div className="relative w-64">
                    <KeenIcon icon="magnifier" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search admins..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input pl-10 w-full"
                    />
                  </div>
                </div>
            </div>
            <div className="card-table scrollable-x-auto">
                <table className="table">
                    <thead>
                        <tr>
                            <th className="min-w-[50px]">
                              <KeenIcon icon="profile-circle" className="text-lg" />
                            </th>
                            <th className="min-w-[200px]">Name</th>
                            <th className="min-w-[250px]">
                              <div className="flex items-center gap-2">
                                <KeenIcon icon="sms" className="text-lg" />
                                <span>Email</span>
                              </div>
                            </th>
                            <th className="min-w-[150px]">
                              <div className="flex items-center gap-2">
                                <KeenIcon icon="shield-tick" className="text-lg" />
                                <span>Role</span>
                              </div>
                            </th>
                            <th className="min-w-[150px]">
                              <div className="flex items-center gap-2">
                                <KeenIcon icon="toggle-on-circle" className="text-lg" />
                                <span>Status</span>
                              </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="text-center p-4">Loading...</td></tr>
                        ) : filteredAdmins.length === 0 ? (
                            <tr><td colSpan={5} className="text-center p-4">No admins found</td></tr>
                        ) : filteredAdmins.map(admin => (
                            <tr key={admin.id}>
                                <td>
                                  <div className="flex items-center justify-start -translate-x-2">
                                    <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
                                      <span className="text-primary font-semibold">
                                        {admin.firstName?.charAt(0)}{admin.lastName?.charAt(0)}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div className="flex flex-col">
                                    <span className="font-medium text-gray-900">
                                      {admin.firstName} {admin.lastName}
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  <span className="text-gray-700">{admin.email}</span>
                                </td>
                                <td>
                                  <select 
                                    className="form-select form-select-sm w-auto"
                                    value={admin.role}
                                    onChange={(e) => handleRoleUpdate(admin.id, e.target.value)}
                                  >
                                    <option value={AdminRoles.DISPATCH}>
                                      🚀 Dispatch
                                    </option>
                                    <option value={AdminRoles.SUPPORT}>
                                      💬 Support
                                    </option>
                                  </select>
                                </td>
                                <td>
                                  <select 
                                    className={`form-select form-select-sm w-auto ${
                                      admin.status === 'active' ? 'text-success' : 'text-danger'
                                    }`}
                                    value={admin.status}
                                    onChange={(e) => handleStatusUpdate(admin.id, e.target.value)}
                                  >
                                    <option value="active" className="text-success">
                                      ✓ Active
                                    </option>
                                    <option value="inactive" className="text-danger">
                                      ✗ Inactive
                                    </option>
                                  </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </Container>
    </Fragment>
  );
};

export { AdminPage };
