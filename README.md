# Clínica

Projeto com ambiente Docker para desenvolvimento do backend, frontend e banco de dados.

## Requisitos

Antes de começar, você precisa ter instalado na máquina:

- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

## Como executar o projeto

### 1. Clonar o repositório

```bash
git clone https://github.com/project-cclinic/clinica.git
```

### 2. Fazer cópia do arquivo .env.example na pasta raiz e renomear para .env

```bash
copy .env.example .env
```
também é necessário fazer para o .env do backend
```bash
copy backend/.env.example backend/.env
```

### 3. Criar containers (Este comando só deve ser usado na primeira vez)

se precisar apagar
```bash
docker compose down
```

```bash
docker compose build

ou

docker compose up -d --build --force-recreate

ou para recriar

docker compose down
```

### 4. Executar containers (Sempre que quiser rodar o projeto)
```bash
docker compose up
```
ou -d (detached) Roda em background (não trava o terminal)
```bash
docker compose up -d 

```

## Banco de dados

O projeto usa PostgreSQL com Knex para gerenciar migrations e seeds. Ao subir o
container do backend com `docker compose up`, as migrations pendentes sao
executadas automaticamente antes do servidor iniciar.

### Verificar status das migrations

```bash
docker exec backend npx knex migrate:status
```

Esse comando mostra quais migrations ja foram executadas e se existe alguma
pendente.

### Executar migrations pendentes

```bash
docker exec backend npm run db:migrate
```

### Criar uma nova migration

```bash
docker exec backend npm run db:migrate:make nome-da-migration
```

### Recriar as tabelas com migrations

```bash
docker exec backend npm run db:migrate:fresh
```

Atencao: esse comando desfaz todas as migrations e executa novamente, apagando
os dados das tabelas recriadas.

### Executar seeds

```bash
docker exec backend npm run db:seed
```

### Criar um novo seed

```bash
docker exec backend npm run db:seed:make nome-do-seed
```

### Recriar banco e executar seeds

```bash
docker exec backend npm run db:migrate:seed:fresh
```

Atencao: esse comando recria as tabelas e depois executa os seeds.

### Projetos e portas
<h4>
  PostgreSQL
  <img
    src="https://img.shields.io/badge/Protocol-TCP-green"
    alt="TCP"
    style="vertical-align: middle;"
  />
</h4>

```bash
127.0.0.1:5432
```

<h4>
  Backend
  <img
    src="https://img.shields.io/badge/Protocol-HTTP-blue"
    alt="TCP"
    style="vertical-align: middle;"
  />
</h4>

```bash 
http://127.0.0.1:3000/api
```
 
<h4>
  Frontend
  <img
    src="https://img.shields.io/badge/Protocol-HTTP-blue"
    alt="TCP"
    style="vertical-align: middle;"
  />
</h4>

```bash 
http://127.0.0.1:9000
```
---

### Stacks utilizadas

<p align="left">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" alt="PostgreSQL" width="50" height="50" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" alt="Node.js" width="50" height="50" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg" alt="Vue.js" width="50" height="50" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/quasar/quasar-original.svg" alt="Quasar" width="50" height="50" />
</p>
