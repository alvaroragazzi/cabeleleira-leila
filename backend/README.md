# Backend Node TypeScript

## Instalar dependências
```sh
npm install
```

## Clonar .env.example
```sh
copy .env.example .env
```

## Criar arquivo de migration
```sh
npm run db:migrate:make create-nome-da-sua-tabela
```

## Rodar migrations
```sh
npm run db:migrate
```

## Apagar as migrations e rodar novamente
```sh
npm run db:migrate:fresh
```

## Criar arquivo de seed
```sh
npm run db:seed:make nome
```

## Rodar seeds
```sh
npm run db:seed
```

## Rodar migrations e seeds
```sh
npm run db:migrate
npm run db:seed
```

## Apagar migrations e seeds e rodar novamente
```sh
npm run db:migrate:seed:fresh
```

## Rodar o projeto
```sh
npm run dev
```

## Compilar o projeto para produção
```sh
npm run build
```
