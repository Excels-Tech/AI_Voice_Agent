import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Users,
  Plus,
  Settings,
  Crown,
  Mail,
  Trash2,
  Edit,
  Building,
  UserPlus,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";

export function WorkspaceManagement() {
  const [workspaces, setWorkspaces] = useState([
    {
      id: 1,
      name: "Acme Corp",
      role: "owner",
      members: 5,
      agents: 12,
      plan: "Pro",
      created: "2024-01-15",
    },
    {
      id: 2,
      name: "Sales Team",
      role: "admin",
      members: 3,
      agents: 4,
      plan: "Business",
      created: "2024-03-20",
    },
  ]);

  const [teamMembers, setTeamMembers] = useState([
    {
      id: 1,
      name: "John Smith",
      email: "john@acmecorp.com",
      role: "owner",
      status: "active",
      joinedAt: "2024-01-15",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah@acmecorp.com",
      role: "admin",
      status: "active",
      joinedAt: "2024-02-01",
    },
    {
      id: 3,
      name: "Mike Davis",
      email: "mike@acmecorp.com",
      role: "member",
      status: "active",
      joinedAt: "2024-02-15",
    },
    {
      id: 4,
      name: "Emily Brown",
      email: "emily@acmecorp.com",
      role: "member",
      status: "pending",
      joinedAt: "2024-03-01",
    },
  ]);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");

  const handleCreateWorkspace = () => {
    const name = prompt("Enter workspace name:");
    if (name) {
      const newWorkspace = {
        id: workspaces.length + 1,
        name,
        role: "owner",
        members: 1,
        agents: 0,
        plan: "Free",
        created: new Date().toISOString().split("T")[0],
      };
      setWorkspaces([...workspaces, newWorkspace]);
      toast.success(`Workspace "${name}" created successfully!`);
    }
  };

  const handleInviteMember = () => {
    if (!inviteEmail) {
      toast.error("Please enter an email address");
      return;
    }
    const newMember = {
      id: teamMembers.length + 1,
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: inviteRole,
      status: "pending",
      joinedAt: new Date().toISOString().split("T")[0],
    };
    setTeamMembers([...teamMembers, newMember]);
    toast.success(`Invitation sent to ${inviteEmail}`);
    setShowInviteModal(false);
    setInviteEmail("");
  };

  const handleRemoveMember = (id: number) => {
    const member = teamMembers.find((m) => m.id === id);
    if (member && confirm(`Remove ${member.name} from workspace?`)) {
      setTeamMembers(teamMembers.filter((m) => m.id !== id));
      toast.success(`${member.name} removed from workspace`);
    }
  };

  const handleChangeRole = (id: number, newRole: string) => {
    setTeamMembers(
      teamMembers.map((m) => (m.id === id ? { ...m, role: newRole } : m))
    );
    toast.success("Role updated successfully");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-white mb-2">Workspaces & Team</h1>
        <p className="text-slate-400">Manage workspaces and team members</p>
      </div>

      {/* Workspaces */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Your Workspaces</CardTitle>
              <CardDescription className="text-slate-400">Multi-tenant workspace management</CardDescription>
            </div>
            <Button onClick={handleCreateWorkspace} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-lg hover:shadow-blue-500/30">
              <Plus className="size-4 mr-2" />
              New Workspace
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {workspaces.map((workspace) => (
              <div
                key={workspace.id}
                className="p-4 border border-slate-800 rounded-lg bg-slate-800/50 hover:border-slate-700 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                      <Building className="size-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white">{workspace.name}</h3>
                        {workspace.role === "owner" && (
                          <Crown className="size-4 text-yellow-400" />
                        )}
                        <Badge variant="outline" className="border-slate-700 text-slate-300">{workspace.plan}</Badge>
                      </div>
                      <p className="text-slate-400 text-sm">
                        {workspace.members} members • {workspace.agents} agents • Created{" "}
                        {workspace.created}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white">
                      <Settings className="size-4" />
                    </Button>
                    {workspace.role === "owner" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-700 hover:bg-red-500/10 hover:border-red-500"
                        onClick={() => {
                          if (confirm(`Delete workspace \"${workspace.name}\"?`)) {
                            setWorkspaces(workspaces.filter((w) => w.id !== workspace.id));
                            toast.success("Workspace deleted");
                          }
                        }}
                      >
                        <Trash2 className="size-4 text-red-400" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Team Members</CardTitle>
              <CardDescription className="text-slate-400">Manage workspace members and permissions</CardDescription>
            </div>
            <Button
              onClick={() => setShowInviteModal(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg hover:shadow-green-500/30"
            >
              <UserPlus className="size-4 mr-2" />
              Invite Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="p-4 border border-slate-800 rounded-lg bg-slate-800/50 flex items-center justify-between hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                    <Users className="size-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white">{member.name}</h4>
                      {member.status === "pending" && (
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                          Pending
                        </Badge>
                      )}
                      {member.role === "owner" && (
                        <Crown className="size-4 text-yellow-400" />
                      )}
                    </div>
                    <p className="text-slate-400 text-sm">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={member.role}
                    onChange={(e) => handleChangeRole(member.id, e.target.value)}
                    disabled={member.role === "owner"}
                    className="px-3 py-1.5 rounded-md border border-slate-700 bg-slate-800 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                  </select>
                  {member.role !== "owner" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-700 hover:bg-red-500/10 hover:border-red-500"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      <Trash2 className="size-4 text-red-400" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-full max-w-md bg-slate-900 border-slate-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Invite Team Member</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-white hover:bg-slate-800">
                  <X className="size-4" />
                </Button>
              </div>
              <CardDescription className="text-slate-400">Send an invitation to join your workspace</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inviteEmail" className="text-slate-300">Email Address</Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inviteRole" className="text-slate-300">Role</Label>
                <select
                  id="inviteRole"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-slate-700 bg-slate-800 text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="member">Member - Can view and use agents</option>
                  <option value="admin">Admin - Can manage agents and settings</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                  onClick={() => setShowInviteModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg hover:shadow-green-500/30"
                  onClick={handleInviteMember}
                >
                  <Mail className="size-4 mr-2" />
                  Send Invite
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Permissions Info */}
      <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white">
                <Crown className="size-5 text-yellow-400" />
                <p>Owner</p>
              </div>
              <ul className="text-slate-300 text-sm space-y-1">
                <li className="flex items-start gap-2">
                  <Check className="size-4 shrink-0 mt-0.5 text-green-400" />
                  <span>Full workspace control</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="size-4 shrink-0 mt-0.5 text-green-400" />
                  <span>Manage billing</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="size-4 shrink-0 mt-0.5 text-green-400" />
                  <span>Delete workspace</span>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white">
                <Settings className="size-5 text-blue-400" />
                <p>Admin</p>
              </div>
              <ul className="text-slate-300 text-sm space-y-1">
                <li className="flex items-start gap-2">
                  <Check className="size-4 shrink-0 mt-0.5 text-green-400" />
                  <span>Create/edit agents</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="size-4 shrink-0 mt-0.5 text-green-400" />
                  <span>Invite members</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="size-4 shrink-0 mt-0.5 text-green-400" />
                  <span>View all analytics</span>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white">
                <Users className="size-5 text-purple-400" />
                <p>Member</p>
              </div>
              <ul className="text-slate-300 text-sm space-y-1">
                <li className="flex items-start gap-2">
                  <Check className="size-4 shrink-0 mt-0.5 text-green-400" />
                  <span>Use agents</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="size-4 shrink-0 mt-0.5 text-green-400" />
                  <span>View call logs</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="size-4 shrink-0 mt-0.5 text-green-400" />
                  <span>Test calls</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}