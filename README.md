# Armor – Multi-Tenant CNAPP Platform  
**By CodeMachine**

Armor is a cloud security platform (similar to Wiz/Orca) designed to provide agentless cloud visibility, misconfiguration scanning, and multi-tenant enterprise SaaS onboarding.  
Armor includes a provider (service seller) interface and isolated customer environments.

---

## 📌 Architecture Overview

### **1. Multi-Tenancy Model**
Armor uses a **schema-per-tenant** model in PostgreSQL.

- Provider admin data lives in `public` schema  
- Each tenant has isolated schema:  
```

t_<hex>/          # tenant schema (unique per tenant)

```
- Each tenant schema contains its own:
- users  
- assets  
- findings  
- cloud metadata  
- logs  

This model guarantees **strong data isolation**, allowing Armor to onboard enterprises with fully segregated environments.

---

## 📌 User Types

### **1. Provider Users (Armor Operators)**
These are employees of **CodeMachine**, the CNAPP provider.

- Stored in `public.provider_admins`
- Have complete authority over the platform
- Can:
- Create tenants
- View tenant metadata
- Generate support access tokens
- Rotate keys
- View platform-wide usage metrics
- Investigate tenant issues (read-only)

### **2. Tenant Users (Customer Users)**  
Stored inside each tenant schema:

- **Root User**  
- First user created when tenant onboarding completes  
- Has full administrative rights (equivalent to “account owner”)

- **Subusers (IAM Users)**  
- Can be assigned granular permissions  
- Feature-scoped access (Assets, Findings, IAM, Cloud Accounts, Settings)
- Pattern similar to AWS IAM

---

## 📌 Backend Stack

- **Node.js + Express** backend  
- **PostgreSQL** with schema-per-tenant isolation  
- **JWT** authentication (Provider & Tenant tokens separated)  
- **Raw SQL** pattern (no Prisma unless explicitly reintroduced later)  
- **Zod** for validation  
- **Rate limiting & request logging (planned)**  
- **Automated tenant provisioning engine**

---

## 📌 Frontend Stack

- React (or Next.js — TBD)  
- Tailwind CSS  
- shadcn/ui components  
- Provider Portal UI  
- Tenant Portal UI  

---

## 📌 Provider Admin API (Armor Operator Portal)

Routes are namespaced under:

```

/armor-admin/*

```

### Key Endpoints

#### **Login**
```

POST /armor-admin/auth/login

```
Returns Provider JWT.

#### **Create Tenant**
```

POST /armor-admin/tenants

```
Workflow:
1. Insert tenant into `public.tenants`
2. Generate unique schema name (`t_<hex>`)
3. Create schema in Postgres
4. Run tenant migrations
5. Insert root user
6. Emit audit log entry

#### **Generate Support Access Token**
```

POST /armor-admin/support-access

```
- Creates short-lived, read-only JWT
- Lets provider support investigate an isolated tenant environment safely

---

## 📌 Tenant API (Customer Portal)

Routes are namespaced under:

```

/api/*

````

### Features
- Tenant login (`/auth/login`)
- IAM (role and feature-based access)
- Cloud accounts onboarding
- Assets & Findings retrieval
- Tenant settings
- Audit logs

### Tenant Login Workflow
A tenant user logs in with:

```json
{
  "email": "root@company.com",
  "password": "password",
  "tenantId": "UUID-of-tenant"
}
````

The token includes:

* tenantId
* schemaName
* user role
* allowed_features[]

---

## 📌 Tenant Provisioning Workflow

### When Provider Admin Creates a Tenant

1. Create row in `public.tenants`
2. Generate schema name `t_<hex>`
3. Create schema in Postgres:

   ```
   CREATE SCHEMA t_ab12ef34;
   ```
4. Apply tenant migrations automatically
5. Create system tables (users, assets, findings, logs, etc.)
6. Insert tenant root user
7. Return onboarding payload:

   ```json
   {
     "tenantId": "...",
     "schema": "t_ab12ef34",
     "rootEmail": "...",
     "createdAt": "..."
   }
   ```

---

## 📌 IAM (Role-Based Access Control)

Each tenant sub-user has:

```json
{
  "role": "analyst",
  "allowed_features": ["assets.read", "findings.read"],
  "denied_features": ["iam.write"]
}
```

Backend middleware enforces:

* Route-level permissions
* Feature-based allow/deny
* Root user override rules

---

## 📌 AWS Integration (Planned MVP Feature)

Armor will support onboarding AWS accounts via:

* CloudFormation stack
* Cross-account IAM role
* STS AssumeRole

Data collected will include:

* EC2 inventory
* IAM users/roles/policies
* S3 permissions
* RDS configuration
* CloudTrail events
* SecurityHub findings

Findings engine stores results in:

```
t_<tenant>.findings
```

---

## 📌 Folder Structure

```
armor/
├── client/           # Frontend (React/Next)
├── server/           # Backend (Express)
│   ├── src/
│   ├── db/
│   ├── middleware/
│   ├── routes/
│   ├── migrations/
│   ├── scripts/
│   └── tests/
└── infra/            # IaC (Planned)
```

---

## 📌 Development Setup

### **1. Create .env**

Copy:

```
cp .env.template .env
```

Set environment variables:

```
DATABASE_URL=postgres://USER:PASS@localhost:5432/armor
JWT_SECRET=<long-random-secret>
```

### **2. Run Migrations**

```
cd server
psql "$DATABASE_URL" -f migrations/000_init_public.sql
```

### **3. Seed Provider Admin**

Creates default CodeMachine admin:

```
node scripts/seed_provider.js
```

### **4. Start Server**

```
npm install
npm run dev
```

---

## 📌 Testing

Run backend tests:

```
cd server
npm test
```

---

## 📌 Deployment (Planned)

* Docker
* Fly.io or AWS ECS
* GitHub Actions CI/CD
* Automated DB migrations

---

## 📌 License

Proprietary
© CodeMachine, 2025

---

## 📌 Notes for Codex & AI Tools

This project follows **strict rules**:

### ✔ Schema-per-tenant architecture

* Never combine data across tenants
* Always respect schema routing middleware
* All tenant tables are created inside `t_<hex>` schemas

### ✔ Provider-level data lives in `public` only

* Provider admins
* Tenant registry
* Audit logs (global)

### ✔ Use Node.js + Express + raw SQL

* Avoid ORM unless explicitly required
* Keep SQL files versioned in `migrations/`

### ✔ Maintain naming conventions

* Product name: **Armor**
* No references to prior names like “Mach”

This README is the **canonical source of truth** for all future development and all AI agents (Codex, Antigravity, etc.) must follow it strictly.

````
