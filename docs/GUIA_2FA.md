# 🔒 Guia de Implementação - 2FA (Two-Factor Authentication)

## 📋 Visão Geral

Sistema de autenticação de dois fatores (2FA) usando TOTP (Time-based One-Time Password), compatível com Google Authenticator, Microsoft Authenticator, Authy, etc.

---

## 🚀 Instalação

```bash
# Instalar dependências
npm install speakeasy qrcode
npm install -D @types/speakeasy @types/qrcode
```

---

## 📁 Arquivos Criados

### 1. **Service Layer**
`lib/auth/two-factor.ts`
- Geração de secrets e QR codes
- Verificação de tokens TOTP
- Gerenciamento de backup codes
- Enable/disable 2FA

### 2. **API Routes**
- `app/api/auth/2fa/route.ts` - CRUD de 2FA
- `app/api/auth/2fa/verify/route.ts` - Verificação de tokens

### 3. **Database Schema**
Campos adicionados ao modelo `Usuario`:
```prisma
twoFactorSecret       String?
twoFactorEnabled      Boolean  @default(false)
twoFactorBackupCodes  String?
```

---

## 🔧 Configuração

### 1. Migração do Banco de Dados

```bash
# Criar migration
npx prisma migrate dev --name add-two-factor-auth

# Aplicar migration
npx prisma migrate deploy
```

### 2. Atualizar NextAuth

Editar `lib/auth.ts` para incluir verificação 2FA no login:

```typescript
async authorize(credentials) {
  // ... existing password verification ...
  
  // Check if 2FA is enabled
  if (user.twoFactorEnabled) {
    return {
      ...user,
      requires2FA: true,
    };
  }
  
  return user;
}
```

---

## 📱 Fluxo de Uso

### **Habilitar 2FA**

1. Usuário vai em Configurações → Segurança
2. Clica em "Habilitar 2FA"
3. Sistema gera QR code
4. Usuário escaneia com app autenticador
5. Usuário digita código de 6 dígitos para confirmar
6. Sistema salva backup codes (8 códigos)
7. Usuário guarda backup codes em local seguro

### **Login com 2FA**

1. Usuário digita email e senha
2. Se 2FA habilitado, mostrar campo para token
3. Usuário digita código de 6 dígitos do app
4. OU usa um backup code se perdeu acesso
5. Sistema valida e faz login

### **Desabilitar 2FA**

1. Usuário vai em Configurações → Segurança
2. Clica em "Desabilitar 2FA"
3. Confirma com senha ou token atual
4. Sistema remove configuração 2FA

---

## 🎨 Componente de UI (Exemplo)

```typescript
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function TwoFactorSetup() {
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [step, setStep] = useState<'generate' | 'verify' | 'complete'>('generate');

  async function generateSecret() {
    const res = await fetch('/api/auth/2fa', { method: 'POST' });
    const data = await res.json();
    
    setQrCode(data.qrCode);
    setSecret(data.secret);
    setBackupCodes(data.backupCodes);
    setStep('verify');
  }

  async function verifyAndEnable() {
    const res = await fetch('/api/auth/2fa', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, token, backupCodes }),
    });

    if (res.ok) {
      setStep('complete');
    } else {
      alert('Token inválido');
    }
  }

  return (
    <div className="space-y-6">
      {step === 'generate' && (
        <Button onClick={generateSecret}>
          Habilitar 2FA
        </Button>
      )}

      {step === 'verify' && (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">1. Escaneie o QR Code</h3>
            <Image src={qrCode} alt="QR Code" width={200} height={200} />
          </div>

          <div>
            <h3 className="font-semibold mb-2">2. Digite o código</h3>
            <Input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="000000"
              maxLength={6}
            />
          </div>

          <Button onClick={verifyAndEnable}>
            Verificar e Ativar
          </Button>
        </div>
      )}

      {step === 'complete' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-green-600">
            ✅ 2FA Habilitado com Sucesso!
          </h3>
          
          <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
            <h4 className="font-semibold mb-2">⚠️ Backup Codes</h4>
            <p className="text-sm mb-2">
              Guarde estes códigos em local seguro. Use-os se perder acesso ao autenticador.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, i) => (
                <code key={i} className="bg-white px-2 py-1 rounded">
                  {code}
                </code>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 🔐 Verificação no Login

Atualizar `app/login/page.tsx`:

```typescript
const [requires2FA, setRequires2FA] = useState(false);
const [userId, setUserId] = useState('');
const [twoFactorToken, setTwoFactorToken] = useState('');

async function handleSubmit(e) {
  e.preventDefault();
  
  const result = await signIn('credentials', {
    email,
    password,
    redirect: false,
  });

  if (result?.requires2FA) {
    setUserId(result.userId);
    setRequires2FA(true);
    return;
  }

  if (!result?.error) {
    router.push('/dashboard');
  }
}

async function handle2FASubmit(e) {
  e.preventDefault();
  
  const res = await fetch('/api/auth/2fa/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, token: twoFactorToken }),
  });

  if (res.ok) {
    router.push('/dashboard');
  } else {
    alert('Token inválido');
  }
}

// UI: Mostrar campo de 2FA se requires2FA === true
```

---

## 📊 Métricas de Segurança

### Antes do 2FA:
- ⚠️ Senha única = ponto único de falha
- ⚠️ Vulnerável a phishing
- ⚠️ Sem proteção adicional

### Depois do 2FA:
- ✅ Dupla camada de proteção
- ✅ Token temporário (30 segundos)
- ✅ Backup codes para emergência
- ✅ Compatível com apps padrão (Google, Microsoft)
- ✅ Redução de 99.9% em contas comprometidas

---

## 🎯 Próximos Passos

1. **Instalar dependências:**
   ```bash
   npm install speakeasy qrcode
   npm install -D @types/speakeasy @types/qrcode
   ```

2. **Aplicar migration:**
   ```bash
   npx prisma migrate dev --name add-two-factor-auth
   ```

3. **Criar página de configuração:**
   - `app/dashboard/settings/security/page.tsx`

4. **Atualizar login:**
   - Adicionar campo de token 2FA

5. **Testes:**
   - Testar habilitação
   - Testar login com 2FA
   - Testar backup codes

---

## 🚨 Considerações Importantes

1. **Backup Codes:** Usuário DEVE guardar em local seguro
2. **Recovery:** Implementar processo de recovery caso perca 2FA
3. **Admin Override:** Admin pode desabilitar 2FA de outros usuários
4. **Auditoria:** Log todas as operações de 2FA
5. **Rate Limiting:** Limitar tentativas de verificação

---

## ✅ Checklist de Implementação

- [x] Service layer criado
- [x] API routes criados
- [x] Schema atualizado
- [ ] Migration aplicada
- [ ] Componente de UI criado
- [ ] Login atualizado
- [ ] Página de configurações criada
- [ ] Testes implementados
- [ ] Documentação atualizada
