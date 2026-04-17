"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface KommoUserEntry {
  id: string;
  kommoUserId: number;
  name: string;
  email: string | null;
  role: string;
  active: boolean;
  _count: { leads: number };
}

const roles = [
  { value: "SDR", label: "SDR", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { value: "CLOSER", label: "Closer", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { value: "MANAGER", label: "Gestor", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  { value: "UNASSIGNED", label: "N/A", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
];

export default function UsersPage() {
  const [users, setUsers] = useState<KommoUserEntry[]>([]);

  useEffect(() => {
    fetch("/api/admin/users").then((r) => r.json()).then(setUsers).catch(() => {});
  }, []);

  const updateRole = async (userId: string, role: string) => {
    try {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role } : u))
      );
      toast.success("Função atualizada");
    } catch {
      toast.error("Erro ao atualizar função");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Usuários</h1>
        <p className="mt-1 text-gray-400">
          Classifique cada usuário como SDR, Closer ou Gestor
        </p>
      </div>

      <Card className="border-white/10 bg-gray-900/60">
        <CardHeader>
          <CardTitle className="text-white">
            Equipe ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-center py-8 text-gray-500">
              Nenhum usuário encontrado. Execute uma sincronização primeiro.
            </p>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 font-semibold text-white">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-white">{user.name}</p>
                      <p className="text-xs text-gray-500">
                        {user.email ?? `ID: ${user.kommoUserId}`} &middot;{" "}
                        {user._count.leads} leads
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {roles.map((r) => (
                      <button
                        key={r.value}
                        onClick={() => updateRole(user.id, r.value)}
                        className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-all ${
                          user.role === r.value
                            ? r.color
                            : "border-white/5 text-gray-600 hover:border-white/10 hover:text-gray-400"
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
