"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/users", { withCredentials: true });
        setUsers(res.data);
        setLoading(false);
      } catch (err) {
        router.push("/login");
      }
    };
    fetchUsers();
  }, [router]);

  const changeRole = async (id, role) => {
    await axios.put(
      `http://localhost:5000/api/admin/user/${id}/role`,
      { role },
      { withCredentials: true }
    );
    setUsers(users.map(u => (u._id === id ? { ...u, role } : u)));
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Admin Panel - Role Management</h1>
      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Role</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="border-b">
              <td className="p-2">{user.name}</td>
              <td className="p-2">{user.email}</td>
              <td className="p-2">{user.role}</td>
              <td className="p-2 flex gap-2">
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                  onClick={() => changeRole(user._id, "user")}
                >
                  User
                </button>
                <button
                  className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                  onClick={() => changeRole(user._id, "admin")}
                >
                  Admin
                </button>
                <button
                  className="bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600"
                  onClick={() => changeRole(user._id, "superadmin")}
                >
                  Superadmin
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
