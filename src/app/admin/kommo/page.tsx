"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function KommoConfigPage() {
  const [form, setForm] = useState({
    subdomain: "",
    clientId: "",
    clientSecret: "",
    redirectUri: "",
    authorizationCode: "",
  });
  const [isConnected, setIsConnected] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/config")
      .then((r) => r.json())
      .then((data) => {
        setForm((prev) => ({
          ...prev,
          subdomain: String(data.kommo_subdomain ?? ""),
          clientId: String(data.kommo_client_id ?? ""),
          redirectUri: String(data.kommo_redirect_uri ?? ""),
        }));
        setIsConnected(data.isConnected);
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setIsConnected(true);
        setForm((prev) => ({ ...prev, authorizationCode: "", clientSecret: "" }));
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Conexão Kommo CRM</h1>
        <p className="mt-1 text-gray-400">
          Configure as credenciais de integração com o Kommo
        </p>
      </div>

      {isConnected && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-400">
          Conectado ao Kommo com sucesso. Os tokens são renovados automaticamente.
        </div>
      )}

      <Card className="border-white/10 bg-gray-900/60">
        <CardHeader>
          <CardTitle className="text-white">Credenciais OAuth2</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subdomain">Subdomínio</Label>
              <Input
                id="subdomain"
                placeholder="suaempresa"
                value={form.subdomain}
                onChange={(e) => setForm({ ...form, subdomain: e.target.value })}
                className="border-white/10 bg-white/5"
              />
              <p className="text-xs text-gray-500">
                A parte antes de .kommo.com na URL
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="redirectUri">Redirect URI</Label>
              <Input
                id="redirectUri"
                placeholder="https://seudominio.com/api/auth/kommo/callback"
                value={form.redirectUri}
                onChange={(e) => setForm({ ...form, redirectUri: e.target.value })}
                className="border-white/10 bg-white/5"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">Client ID</Label>
              <Input
                id="clientId"
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                className="border-white/10 bg-white/5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientSecret">Client Secret</Label>
              <Input
                id="clientSecret"
                type="password"
                placeholder={isConnected ? "••••••••" : ""}
                value={form.clientSecret}
                onChange={(e) => setForm({ ...form, clientSecret: e.target.value })}
                className="border-white/10 bg-white/5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="authCode">Código de Autorização</Label>
            <Input
              id="authCode"
              placeholder="Cole o authorization code do Kommo aqui"
              value={form.authorizationCode}
              onChange={(e) => setForm({ ...form, authorizationCode: e.target.value })}
              className="border-white/10 bg-white/5"
            />
            <p className="text-xs text-gray-500">
              O código expira em 20 minutos. Após salvar, os tokens serão obtidos automaticamente.
            </p>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Salvando..." : "Salvar e Conectar"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-gray-900/60">
        <CardHeader>
          <CardTitle className="text-white">Como configurar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-400">
          <p>1. Acesse <strong className="text-gray-200">{form.subdomain || "suaempresa"}.kommo.com</strong></p>
          <p>2. Vá em <strong className="text-gray-200">Configurações &rarr; Integrações</strong></p>
          <p>3. Clique em <strong className="text-gray-200">Criar integração</strong></p>
          <p>4. Preencha o nome e o Redirect URI acima</p>
          <p>5. Copie o Client ID, Client Secret e Código de Autorização</p>
          <p>6. Cole aqui e clique em &quot;Salvar e Conectar&quot;</p>
        </CardContent>
      </Card>
    </div>
  );
}
