# Backend Node TypeScript

## Instalar dependências
```sh
docker exec -i backend_leila npm install
```

## Clonar .env.example
```sh
docker exec -i backend_leila copy .env.example .env
```

## Criar arquivo de migration
```sh
docker exec -i backend_leila npm run db:migrate:make create-nome-da-sua-tabela
```

## Rodar migrations
```sh
docker exec -i backend_leila npm run db:migrate
```

## Apagar as migrations e rodar novamente
```sh
docker exec -i backend_leila npm run db:migrate:fresh
```

## Criar arquivo de seed
```sh
docker exec -i backend_leila npm run db:seed:make nome
```

## Rodar seeds
```sh
docker exec -i backend_leila npm run db:seed
```

## Rodar migrations e seeds
```sh
docker exec -i backend_leila npm run db:migrate
docker exec -i backend_leila npm run db:seed
```

## Apagar migrations e seeds e rodar novamente
```sh
docker exec -i backend_leila npm run db:migrate:seed:fresh
```

## Rodar o projeto
```sh
docker exec -i backend_leila npm run dev
```

## Compilar o projeto para produção
```sh
docker exec -i backend_leila npm run build 
```
