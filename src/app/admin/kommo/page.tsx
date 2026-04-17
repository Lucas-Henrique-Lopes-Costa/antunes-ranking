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
    accessToken: "",
  });
  const [isConnected, setIsConnected] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

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
        setForm((prev) => ({
          ...prev,
          authorizationCode: "",
          clientSecret: "",
          accessToken: "",
        }));
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await fetch("/api/admin/config/test");
      const data = await res.json();
      if (res.ok) {
        toast.success(`Conexão ok — conta: ${data.account}`);
      } else {
        toast.error(data.error ?? "Falha ao testar");
      }
    } catch {
      toast.error("Erro ao testar conexão");
    } finally {
      setTesting(false);
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
        <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-400">
          <span>Token configurado. Clique em &quot;Testar conexão&quot; pra validar.</span>
          <Button
            onClick={handleTest}
            disabled={testing}
            variant="outline"
            className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
          >
            {testing ? "Testando..." : "Testar conexão"}
          </Button>
        </div>
      )}

      <Card className="border-white/10 bg-gray-900/60">
        <CardHeader>
          <CardTitle className="text-white">Token de longa duração</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
              A parte antes de <code>.kommo.com</code> na URL (ex: <code>suaempresa</code>)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accessToken">Access Token</Label>
            <textarea
              id="accessToken"
              rows={6}
              placeholder={isConnected ? "Token salvo — cole um novo pra substituir" : "Cole o token gerado no Kommo aqui"}
              value={form.accessToken}
              onChange={(e) => setForm({ ...form, accessToken: e.target.value })}
              className="w-full rounded-md border border-white/10 bg-white/5 p-3 font-mono text-xs text-white placeholder:text-gray-600 focus:border-white/20 focus:outline-none"
            />
            <p className="text-xs text-gray-500">
              Gere no Kommo em <strong>Integrações → sua integração → Access token de longa duração</strong>
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? "Salvando..." : "Salvar"}
            </Button>
            {form.accessToken && (
              <Button
                onClick={async () => {
                  await handleSave();
                  await handleTest();
                }}
                disabled={saving || testing}
                variant="secondary"
              >
                Salvar e testar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-gray-900/60">
        <CardHeader>
          <CardTitle className="text-white">OAuth2 (avançado)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">
            Use apenas se for fazer o fluxo OAuth2 completo com code + refresh token.
            Para uso normal, prefira o &quot;Token de longa duração&quot; acima.
          </p>
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
            <Label htmlFor="redirectUri">Redirect URI</Label>
            <Input
              id="redirectUri"
              placeholder="https://seudominio.com/api/auth/kommo/callback"
              value={form.redirectUri}
              onChange={(e) => setForm({ ...form, redirectUri: e.target.value })}
              className="border-white/10 bg-white/5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="authCode">Código de Autorização</Label>
            <Input
              id="authCode"
              placeholder="Authorization code (expira em 20min)"
              value={form.authorizationCode}
              onChange={(e) => setForm({ ...form, authorizationCode: e.target.value })}
              className="border-white/10 bg-white/5"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
