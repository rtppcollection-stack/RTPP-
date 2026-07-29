import React, { useState, useEffect } from "react";
import {
  UserCheck,
  Shield,
  Edit3,
  Eye,
  User,
  Search,
  Plus,
  Save,
  Trash2,
  CheckCircle2,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/integrations/supabase/types";
import { useWallet } from "@/lib/wallet";
import { toast } from "sonner";

interface UserProfileItem {
  id: string; // wallet address or UUID
  username?: string | null;
  role: UserRole;
  created_at?: string;
}

const STORAGE_KEY_ROLES = "rtpp_user_roles_override_v1";

const DEFAULT_MOCK_USERS: UserProfileItem[] = [
  {
    id: "0x82627aeEDD0E7f0B6d45d443A1F59bCD2Adcd68f",
    username: "TreasuryAdmin",
    role: "admin",
    created_at: new Date().toISOString(),
  },
  {
    id: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    username: "ChiefEditor",
    role: "editor",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "0xF39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    username: "SecurityAuditor",
    role: "monitor",
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

export function UserRoleManagement() {
  const { address } = useWallet();
  const [users, setUsers] = useState<UserProfileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [newUserId, setNewUserId] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("editor");
  const [newUsername, setNewUsername] = useState("");

  // Load user profiles from Supabase and sync local overrides
  const loadUsers = async () => {
    setLoading(true);
    let loadedFromSupabase = false;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, role, created_at");

      if (!error && data && data.length > 0) {
        setUsers(data as UserProfileItem[]);
        loadedFromSupabase = true;
      }
    } catch {
      // ignore
    }

    if (!loadedFromSupabase) {
      // Fallback to localStorage or defaults
      try {
        const saved = localStorage.getItem(STORAGE_KEY_ROLES);
        if (saved) {
          setUsers(JSON.parse(saved));
        } else {
          setUsers(DEFAULT_MOCK_USERS);
        }
      } catch {
        setUsers(DEFAULT_MOCK_USERS);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const saveLocalUsers = (updated: UserProfileItem[]) => {
    setUsers(updated);
    try {
      localStorage.setItem(STORAGE_KEY_ROLES, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Update user role
  const handleRoleChange = async (userId: string, targetRole: UserRole) => {
    // Attempt Supabase DB update
    try {
      await supabase
        .from("profiles")
        .upsert({ id: userId, role: targetRole, updated_at: new Date().toISOString() });
    } catch {
      // ignore
    }

    // Local state update
    const updated = users.map((u) => (u.id === userId ? { ...u, role: targetRole } : u));
    saveLocalUsers(updated);
    toast.success(`User role updated to '${targetRole.toUpperCase()}'!`);
  };

  // Assign new user/wallet role
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = newUserId.trim();
    if (!cleanId) {
      toast.error("Please enter a valid user ID or wallet address.");
      return;
    }

    const newUser: UserProfileItem = {
      id: cleanId,
      username: newUsername.trim() || cleanId.slice(0, 8),
      role: newRole,
      created_at: new Date().toISOString(),
    };

    try {
      await supabase.from("profiles").upsert({
        id: cleanId,
        username: newUsername.trim() || null,
        role: newRole,
        updated_at: new Date().toISOString(),
      });
    } catch {
      // ignore
    }

    const existingIndex = users.findIndex((u) => u.id.toLowerCase() === cleanId.toLowerCase());
    let updated: UserProfileItem[];
    if (existingIndex >= 0) {
      updated = [...users];
      updated[existingIndex] = newUser;
    } else {
      updated = [newUser, ...users];
    }

    saveLocalUsers(updated);
    setNewUserId("");
    setNewUsername("");
    toast.success(`Role assigned: '${newRole.toUpperCase()}' for ${cleanId.slice(0, 10)}...`);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.id.toLowerCase().includes(search.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="rounded-xl border border-amber-500/30 bg-surface-2/60 p-5 space-y-5">
      <div className="flex items-center justify-between border-b border-border/60 pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-amber-500/15 p-2 text-amber-400">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              User Role Management &amp; Permissions (ခန့်အပ်ရေး)
            </h3>
            <p className="text-xs text-muted-foreground">
              Grant Admin, Editor, or Monitor privileges to user accounts and Web3 wallets.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-48 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search wallet / username..."
              className="pl-8 h-8 text-xs font-mono bg-surface border-border"
            />
          </div>
        </div>
      </div>

      {/* Grant New Role Form */}
      <form
        onSubmit={handleAddUser}
        className="p-3.5 rounded-lg bg-surface/80 border border-border/80 space-y-3"
      >
        <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <Plus className="h-3.5 w-3.5 text-primary" /> Assign Role to New / Existing User
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Input
            value={newUserId}
            onChange={(e) => setNewUserId(e.target.value)}
            placeholder="Wallet address / User ID (0x...)"
            className="font-mono text-xs bg-surface-2 border-border"
          />
          <Input
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="Username (Optional)"
            className="font-mono text-xs bg-surface-2 border-border"
          />
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as UserRole)}
            className="w-full rounded-md border border-input bg-surface-2 px-3 py-1.5 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="admin">ADMIN (Full Access)</option>
            <option value="editor">EDITOR (Content Creation)</option>
            <option value="monitor">MONITOR (Read-Only Logs)</option>
            <option value="user">USER (Standard Member)</option>
          </select>
        </div>
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            className="bg-primary text-primary-foreground font-bold text-xs h-8 gap-1"
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Confirm Role Assignment
          </Button>
        </div>
      </form>

      {/* Roles Table */}
      <div className="overflow-x-auto rounded-lg border border-border/60">
        <Table>
          <TableHeader className="bg-surface-2/80 text-[10px] uppercase">
            <TableRow>
              <TableHead className="py-2.5 px-3">User / Wallet ID</TableHead>
              <TableHead className="py-2.5 px-3">Username</TableHead>
              <TableHead className="py-2.5 px-3">Active Role</TableHead>
              <TableHead className="py-2.5 px-3 text-right">Change Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs font-mono divide-y divide-border/40">
            {filteredUsers.map((u) => (
              <TableRow key={u.id} className="hover:bg-surface-2/40">
                <TableCell className="py-2.5 px-3 font-bold text-foreground">
                  <span className="truncate max-w-[200px] inline-block">{u.id}</span>
                </TableCell>
                <TableCell className="py-2.5 px-3 text-muted-foreground">
                  {u.username || "—"}
                </TableCell>
                <TableCell className="py-2.5 px-3">
                  <Badge
                    className={`font-mono text-[10px] font-bold uppercase ${
                      u.role === "admin"
                        ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                        : u.role === "editor"
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                          : u.role === "monitor"
                            ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40"
                            : "bg-surface-2 text-muted-foreground"
                    }`}
                  >
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell className="py-2.5 px-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="sm"
                      variant={u.role === "admin" ? "default" : "outline"}
                      onClick={() => handleRoleChange(u.id, "admin")}
                      className={`h-7 text-[10px] px-2 ${
                        u.role === "admin" ? "bg-amber-500 text-black font-bold" : "text-amber-400"
                      }`}
                    >
                      Admin
                    </Button>
                    <Button
                      size="sm"
                      variant={u.role === "editor" ? "default" : "outline"}
                      onClick={() => handleRoleChange(u.id, "editor")}
                      className={`h-7 text-[10px] px-2 ${
                        u.role === "editor"
                          ? "bg-emerald-500 text-black font-bold"
                          : "text-emerald-400"
                      }`}
                    >
                      Editor
                    </Button>
                    <Button
                      size="sm"
                      variant={u.role === "monitor" ? "default" : "outline"}
                      onClick={() => handleRoleChange(u.id, "monitor")}
                      className={`h-7 text-[10px] px-2 ${
                        u.role === "monitor" ? "bg-cyan-500 text-black font-bold" : "text-cyan-400"
                      }`}
                    >
                      Monitor
                    </Button>
                    <Button
                      size="sm"
                      variant={u.role === "user" ? "default" : "outline"}
                      onClick={() => handleRoleChange(u.id, "user")}
                      className="h-7 text-[10px] px-2 text-muted-foreground"
                    >
                      User
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
