# Sistema de Levantamiento SOP Automatizado

Sistema completo para automatização de levantamento de SOPs empresariais com IA integrada.

## 🚀 Deployment Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS → Vercel
- **Backend**: Node.js + Express + TypeScript → Railway  
- **Database**: PostgreSQL + Supabase
- **AI Integration**: Claude 3.5 Sonnet + OpenAI
- **Authentication**: Supabase Auth

## 🏗️ Arquitetura

```
├── frontend/          # Next.js application
├── src/              # Backend Node.js application
│   ├── interfaces/   # Controllers & Routes
│   ├── services/     # Business logic
│   ├── infrastructure/ # Database & external services
│   └── shared/       # Middlewares & utilities
└── database/         # SQL schemas & migrations
```

## 🔧 Environment Variables

### Backend (.env)
```bash
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
CLAUDE_API_KEY=...
OPENAI_API_KEY=...
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 🚀 Quick Start

### Local Development
```bash
# Backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

### Production Deployment
- Frontend: Connected to Vercel via GitHub
- Backend: Connected to Railway via GitHub
- Database: Supabase production instance

## 🔐 Security & Compliance

- LGPD compliance completa
- Encryption at rest e in transit
- Audit logging completo
- Role-based access control
- Security headers configurados

## 📊 Features

- Dashboard executivo em tempo real
- Formulários dinâmicos com IA
- Análise automática de processos
- Geração de SOPs automatizada
- Sistema de notificações
- Compliance LGPD integrado

## 🔗 URLs de Produção

- **Frontend**: https://sop-system-frontend.vercel.app
- **Backend**: https://sop-system-backend.railway.app
- **API Docs**: https://sop-system-backend.railway.app/api-docs