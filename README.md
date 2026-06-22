# Leila salão de beleza

Sistema de gerenciamento do salão de beleza da Leila para o teste da vaga de Dev na DSIN com todas as funcionalidades solicitadas + adicionais:

- Login do usuário no sistema
- Área do cliente para consultar, editar, cancelar e realizar agendamentos
- Controle de serviços prestados (nome, duração, preço e imagem de referência)
- Controle de agenda (horário de trabalho, agendamento de clientes e gerenciamento automático de tempo entre as agendas)
- Controle de usuários que usam o sistema
- Controle de clientes (nome, telefone, e-mail)
- Indicadores de desempenho semanal

Você pode rodar esse sistema no seu computador ou acessá-lo online pelo link:

- Área do usuário: [https://testedsin.aragazzi.cloud/#/login](https://testedsin.aragazzi.cloud/#/login) (Logar com Código: 1, Senha: 123456)
- Área do cliente: [https://testedsin.aragazzi.cloud/#/areaCliente/login](https://testedsin.aragazzi.cloud/#/areaCliente/login) (Logar com telefone 11987654321)

**O sistema está hospedado no meu servidor público, então pode ser acessado de qualquer dispositivo conectado à internet.**

## Pontos de melhoria para o sistema
Vou apontar o que ainda pode ser melhorado nessa sistema (não houve tempo para implementar essas funcionalidades)

- Validar se tem agendamento marcado futuramente antes de alterar o horário de trabalho
- Criar excessões de agenda, exemplo: Criar excessões na agenda para não trabalhar no dia X de horário Y até horário Z
- Funcionalidade para os clientes avaliarem o serviço prestado com uma nota de 1 a 5
- Indicadores mais completos e com filtros de data
- Mais opções de customização do cliente (Alterar foto, nome, telefone e e-mail)


## Prints do sistema estão na pasta prints_e_video_sistema
Vídeo mostrando o sistema: [[Git](https://youtu.be/7VKvbG3iGNk)]([https://git-scm.com/](https://youtu.be/7VKvbG3iGNk))

## Requisitos

Antes de começar, você precisa ter instalado na máquina:

- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

## Como executar o projeto

### 1. Clonar o repositório

```bash
git clone https://github.com/alvaroragazzi/cabeleleira-leila.git
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
docker compose up -d

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
docker exec backend_leila npx knex migrate:status
```

Esse comando mostra quais migrations ja foram executadas e se existe alguma
pendente.

### Executar migrations pendentes

```bash
docker exec backend_leila npm run db:migrate
```

### Criar uma nova migration

```bash
docker exec backend_leila npm run db:migrate:make nome-da-migration
```

### Recriar as tabelas com migrations

```bash
docker exec backend_leila npm run db:migrate:fresh
```

Atenção: esse comando desfaz todas as migrations e executa novamente, apagando
os dados das tabelas recriadas.

### Executar seeds

```bash
docker exec backend_leila npm run db:seed
```

### Criar um novo seed

```bash
docker exec backend_leila npm run db:seed:make nome-do-seed
```

### Recriar banco e executar seeds

```bash
docker exec backend_leila npm run db:migrate:seed:fresh
```

Atencao: esse comando recria as tabelas e depois executa os seeds.

### Projetos e portas
<h4>
  PostgreSQL (Banco de dados)
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
  Backend (Node.js, TypeScript)
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
  Frontend (Quasar, Vue.js)
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
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original-wordmark.svg" alt="Docker" width="80" height="80" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original-wordmark.svg" alt="PostgreSQL" width="80" height="80" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original-wordmark.svg" alt="Node.js" width="80" height="80" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vuejs/vuejs-original-wordmark.svg" alt="Vue.js" width="80" height="80" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/quasar/quasar-original-wordmark.svg" alt="Quasar" width="80" height="80" />
</p>
