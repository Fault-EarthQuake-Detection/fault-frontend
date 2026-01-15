/* eslint-disable react-hooks/set-state-in-effect */
// edit-roles/page.tsx

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2, User } from "lucide-react";
import Image from "next/image";

const API_URL = "https://fault-dbservice.vercel.app/api"; 

export default function UsersPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
    });
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleChangeRole = async (userId: string, newRole: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    await fetch(`${API_URL}/admin/users/${userId}/role`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ role: newRole })
    });
    fetchData();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-orange-600"/></div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">User</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Role</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {users.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden relative">
                                    {u.avatarUrl ? <Image src={u.avatarUrl} alt="Ava" fill className="object-cover"/> : <User className="p-1 h-full w-full text-gray-400"/>}
                                </div>
                                <span className="font-semibold text-sm">{u.username}</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{u.role}</span>
                            </td>
                            <td className="px-6 py-4">
                                <select value={u.role} onChange={(e) => handleChangeRole(u.id, e.target.value)} className="text-xs border-gray-300 rounded-lg p-1.5 bg-white">
                                    <option value="USER">User</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
}