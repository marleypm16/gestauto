# Repository Engineering Audit: GestAuto

## 1. Executive Summary

### Project purpose
O GestAuto é uma aplicação de software (SaaS multi-tenant) projetada para auxiliar a gestão de estéticas automotivas e oficinas. O sistema resolve problemas operacionais gerenciando clientes, ordens de serviço, veículos, estoque e controle financeiro. 

### Current maturity
O projeto encontra-se em estágio inicial/intermediário de desenvolvimento (MVP). Possui uma base arquitetural moderna definida, modelagem de dados abrangente e rotas estruturadas, mas apresenta falhas críticas de implementação, ausência de testes, documentação desatualizada e implementações incompletas de segurança.

### Overall assessment
O repositório apresenta um caso de uso interessante para o portfólio (um SaaS multi-tenant), utilizando uma stack muito atual e de alta performance (Fastify, Prisma, Zod). No entanto, o código revela lacunas práticas que impediriam a execução do projeto em produção neste momento, especialmente falhas de resposta de rede (endpoints que "penduram"), falta de transações em banco de dados e divergências entre a infraestrutura documentada e a executada.

---

# 2. Project Understanding

## Main use cases
- Cadastro de proprietários de oficinas e suas respectivas empresas.
- Gestão de clientes e seus veículos.
- Criação e controle do ciclo de vida de Ordens de Serviço.
- Controle de estoque e produtos.

## Main modules
- **Autenticação:** Login, registro e JWT.
- **Empresas (Tenants):** Isolamento de dados por oficina.
- **Clientes & Veículos:** Cadastro unificado.
- **Serviços & Ordens de Serviço:** Execução do trabalho automotivo e financeiro.
- **Estoque:** Cadastro de produtos.

## Core domain entities
`User`, `Empresa`, `UsuarioEmpresa` (Pivot para permissões), `Clientes`, `Carros`, `OrdemServico`, `Produtos`, `Estoque`.

## Main workflows
Registro da Oficina -> Autenticação JWT -> Cadastro de Cliente/Carro -> Criação de Ordem de Serviço -> Conclusão.

## Technology stack
- **Backend:** Node.js, Fastify, TypeScript
- **Banco de Dados:** PostgreSQL (via Prisma ORM)
- **Cache/Sessões:** Redis
- **Validação:** Zod

## Current project stage
Desenvolvimento ativo / Protótipo avançado. Faltam refinamentos essenciais para ambiente de produção.

---

# 3. What Is Already Strong

- **Escolha da Stack:** A combinação de Fastify + Zod + Prisma é excelente, entregando alta performance e tipagem rigorosa end-to-end. O uso de `fastify-type-provider-zod` para validação de esquemas de rotas está muito bem implementado.
- **Isolamento de Tenants:** A modelagem no banco de dados e a validação via `validateEmpresaAccess` demonstram a intenção correta de impedir que usuários de uma oficina acessem dados de outra.
- **Estrutura de Rotas:** O código das rotas (ex: `client.routes.ts`) é claro, com definições explícitas de parâmetros obrigatórios (`querystring`, `params`, `body`).

---

# 4. Architecture

## Current architecture
O sistema segue uma arquitetura orientada a rotas e controladores (Controller-Service-Model). O Fastify gerencia o roteamento; os controladores lidam com as requisições e enviam para os serviços, que encapsulam a lógica de negócios e as consultas ao Prisma.

## Positive aspects
A injeção de middlewares, como o `authMiddleware`, e a modularização de rotas com `app.register` são implementações idiomáticas e eficientes do ecossistema Fastify.

## Problems

### Falha crítica no endpoint de registro (Request Hang)
**Evidence:**
`app/auth/authController.ts` (linha ~132)

**Problem:**
O método `register` executa a criação de usuário e empresa, finalizando com `await prisma.usuarioEmpresa.create(...)`, porém não invoca nenhum `reply.send()`. O cliente fará a requisição e a conexão ficará pendente até ocorrer timeout.

**Impact:**
O registro de novos usuários não funciona sob a perspectiva do cliente (Frontend receberá erro de timeout).

**Recommendation:**
Adicionar um retorno padronizado de sucesso (Ex: `reply.status(201).send({ message: "Registro concluído com sucesso" })`) no final da função.

**Priority:**
P0

---

### Inconsistência de Dados no Registro (Ausência de Transação)
**Evidence:**
`app/auth/authController.ts` (linha ~104)

**Problem:**
A criação de `Empresa`, `User` e `UsuarioEmpresa` acontece em etapas isoladas sem envelopamento de transação (Transaction). Se o usuário for criado, mas ocorrer uma falha de rede ao criar `UsuarioEmpresa`, o banco ficará com dados órfãos.

**Impact:**
Potencial corrupção de domínio, exigindo limpeza manual do banco de dados e frustrando a experiência do usuário que não conseguirá se recadastrar (o email constará como existente, mas ele não tem empresa associada).

**Recommendation:**
Envolver as operações com `$prisma.$transaction`.

**Priority:**
P1

---

### Paginação com Ordenação Falha via Processamento em Memória
**Evidence:**
`app/services/clientService.ts` (linha ~157)

**Problem:**
A busca de clientes usa paginação no banco de dados (`skip`, `take`), mas o campo virtual de `totalGasto` é iterado no backend na página retornada. Ao tentar ordenar por `totalGasto`, a aplicação só ordena os itens *daquela página específica*, ignorando clientes que gastaram mais mas que estão em outras páginas do banco.

**Impact:**
A ordenação de ranking financeiro de clientes apresentará resultados matematicamente incorretos na interface.

**Recommendation:**
A delegação da soma `totalGasto` e sua respectiva ordenação deve ser feita diretamente via banco de dados (ex: Query bruta, sub-queries ou Views no Prisma) em vez de ser resolvida no JS em memória.

**Priority:**
P1

---

### Redis Blacklist (Dead Code)
**Evidence:**
`app/auth/authController.ts` (logout) e `app/middleware/middleware.ts`

**Problem:**
O logout adiciona o token na chave `blacklist:${token}`. Contudo, o `authMiddleware` que valida requisições autenticadas, nunca checa essa chave de blacklist. O validador simplesmente checa se `storedToken === token` na chave do usuário (single-session). 

**Impact:**
A adição à blacklist gasta processamento desnecessário, uma vez que nunca é validada. A premissa de invalidar sessões via Redis não foi concluída corretamente.

**Recommendation:**
No `middleware.ts`, verificar se o token existe na blacklist. Se sim, rejeitar a requisição. Em seguida, limpar a lógica do `verifyToken`.

**Priority:**
P2

---

# 5. Code Quality

- **Erros de Digitação Críticos:** No logout, o código tenta limpar o cookie chamado `'acessToken'` com a falta da letra 'c' (`reply.clearCookie('acessToken')`). Sendo assim, o logout no frontend falhará ao limpar as credenciais locais.
- **Tratamento de Exceções:** Nos controllers, o padrão `res.code(500).send({ message: error.message })` tem o potencial de vazar stack traces e queries do Prisma para o client. É recomendado o uso de mensagens genéricas para produção.

---

# 6. Data Model

A modelagem de dados no Prisma está muito boa e robusta. Enumerações como `StatusEmpresa`, `StatusAssinatura` e relacionamentos N:N (`UsuarioEmpresa`) evidenciam domínio sobre relacional. 
Ponto de atenção: Existem dois IDs que ligam Cliente à Oficina: `empresa_id` e `funcionario_id`. A obrigatoriedade do cliente pertencer ao `funcionario_id` pode gerar atrito caso esse funcionário seja desligado da oficina.

---

# 7. Security

## Medium findings
- **Bcrypt Síncrono:** Em `findUserAuth.ts`, é usado `bcrypt.compareSync`. Em Node.js, funções criptográficas síncronas bloqueiam o Event Loop, permitindo ataques de negação de serviço (DoS) por contenção de requisições de login simultâneas. Deve-se usar a versão async `await bcrypt.compare()`.
- **JWT Secret Padrão:** No `plugin/jwt.ts`, há fallback de senha para `"segredo-super-forte"`. É importante que não exista fallback desse tipo para não causar falsas sensações de segurança se o `.env` estiver quebrado.

---

# 8. Testing

## Existing strategy
Não existem testes implementados no repositório.

## Highest-value testes to add
1. Teste de integração ponta a ponta (E2E) para a jornada de Autenticação (Registro e Login).
2. Teste de integração para validação de tenant: Garantir que o Usuário 1 não possa acessar a `empresaId` do Usuário 2.

---

# 9. Developer Experience

**Problem:** A documentação está conflitante. O `README.md` elenca "Integração com MongoDB", porém o `docker-compose.yaml` levanta o PostgreSQL e o Prisma está configurado para Postgres.
**Problem:** Ausência de um `.env.example`. Não é possível saber logo de cara quais variáveis a aplicação exige.

> Um novo desenvolvedor não conseguirá iniciar a aplicação perfeitamente só seguindo o README, pois faltará a instrução de criar o arquivo de variáveis de ambiente.

---

# 10. CI/CD and Operations

Não existe fluxo de CI/CD. Sugere-se pelo menos a criação de um `.github/workflows/ci.yml` básico que rode `tsc --noEmit` para garantir que as tipagens do TypeScript compilaram perfeitamente no push.

---

# 11. Documentation

- Corrigir o `README.md` refutando as referências ao MongoDB.
- Documentar os passos exatos de setup (`npm install`, configurar `.env`, rodar `docker-compose up -d`, `npx prisma db push`).

---

# 12. Product Completeness

## Essential missing features
- Resposta de sucesso ao término do Registro.
- Limpeza real do cookie de autenticação no Logout (correção do typo).

## Important improvements
- Refatorar a listagem de clientes (totalGasto) via SQL puro/Agregação no Prisma.

---

# 13. Portfolio Analysis

## What currently demonstrates professional engineering
O isolamento dos escopos da empresa. É comum desenvolvedores juniores fazerem sistemas com tudo num pote só (um salão de carros genérico). Separar os dados por empresa via `validateEmpresaAccess` exibe uma ótima mentalidade arquitetural de multi-tenancy.

## What weakens the repository's presentation
Os bugs silenciosos que o autor pode não ter percebido por falta de testes (como a rota de registro que trava para sempre sem emitir `res.send`).
A menção ao MongoDB no README enquanto o projeto roda em Postgres passa uma impressão forte de que o documento foi gerado sem atenção ou copiado de outro projeto.

---

# 15. Technical Debt

| ID    | Problem | Evidence | Impact | Priority | Effort |
| ----- | ------- | -------- | ------ | -------- | ------ |
| TD-01 | Handler de Registro sem retorno | `authController.ts` | Timeout na UI | P0 | Small |
| TD-02 | Ausência de Transações na Criação de Usuário/Empresa | `authController.ts` | Dados inconsistentes | P1 | Small |
| TD-03 | Bug no clearCookie do Logout | `authController.ts` | Usuário logado falso | P1 | Small |
| TD-04 | N+1 e Erro Matemático na Paginação com Ordenação | `clientService.ts` | Erro visual UI | P1 | Medium |
| TD-05 | Bcrypt travando Event Loop | `findUserAuth.ts` | Performance | P2 | Small |
| TD-06 | README com stack desatualizada e sem .env.example | `README.md` | Dev Experience | P2 | Small |

---

# 16. Recommended Evolution

## Phase 1 — Foundation
1. Corrigir o request hang no `authController.ts`.
2. Consertar o erro de digitação no `clearCookie`.
3. Arrumar o README e criar `.env.example`.

## Phase 2 — Architecture
1. Aplicar Transactions do Prisma nas lógicas que enviam mais de uma inserção dependente para o banco.
2. Alterar o Sync Crypto para Async Crypto.

## Phase 3 — Reliability
1. Modificar a arquitetura da filtragem da listagem de clientes, delegando a totalização (`totalGasto`) e ordenação para o banco de dados via raw query.

---

# 17. Actionable Backlog

## P0 — Critical

### P0-01 — Corrigir Endpoint de Registro Pendente
**Why:** Requisições de registro expiram porque o servidor nunca responde.
**Scope:** `app/auth/authController.ts` no final do método `register`.
**Done when:** O método enviar uma resposta contendo `201 Created` no fim da rotina.

---

## P1 — High Priority

### P1-01 — Transação na Criação de Tenant e Admin
**Why:** Uma falha parcial não reverte as ações no BD.
**Scope:** `app/auth/authController.ts` (método `register`).
**Done when:** O `$prisma.$transaction` envolver o cadastro da Empresa, Usuário e UsuarioEmpresa.

### P1-02 — Corrigir Nomenclatura no Logout (Clear Cookie)
**Why:** O typo `acessToken` previne que a credencial seja apagada no navegador do cliente.
**Scope:** `app/auth/authController.ts` (método `logout`).
**Done when:** A linha for corrigida para `accessToken`.

### P1-03 — Refatorar Busca de Clientes (Ordenação vs Paginação)
**Why:** A lógica atual quebra a funcionalidade de listagem de "Melhores Clientes", além de iterar e calcular totais em memória de forma cara.
**Scope:** `app/services/clientService.ts`.
**Done when:** A paginação classificada por `totalGasto` trouxer os maiores compradores a nível de banco de dados, independente de qual página esteja.

---

## P2 — Engineering Improvements

### P2-01 — Substituir CompareSync por Async
**Why:** Bloqueia a thread principal do Node.
**Scope:** `app/utils/findUserAuth.ts`.
**Done when:** Implementar `await bcrypt.compare(...)`.

### P2-02 — Consolidar a Blacklist de Autenticação
**Why:** Ou o middleware valida a chave `blacklist:${token}`, ou se remove a chave para economizar recursos.
**Scope:** `app/middleware/middleware.ts` e `app/auth/authController.ts`.
**Done when:** O processo de rejeitar requisições de tokens deslogados for executado de ponta-a-ponta e logicamente testável.

---

# 18. Five Highest-Impact Improvements

1. **Garantir retorno (`reply.send`) da API de Registro** para simplesmente fazer o sistema viável.
2. **Utilizar Transações (Prisma Transaction)** para blindar a modelagem de eventuais quedas no setup.
3. **Refatorar o motor de busca do Cliente** para não executar agregações intensas em memória sobre paginações incorretas.
4. **Acertar o erro primário do cookie** para garantir o ciclo base de acesso e fim de sessão do frontend.
5. **Atualizar o Readme & .env.example** para mostrar aos avaliadores que o dev se importa com o deployability de outro programador.

---

# 19. Interview Value

**O trade-off da Paginação em Memória:**
Uma excelente discussão que esse projeto possibilita é: "Como você implementaria a ordenação de um relatorio por total gasto sem prejudicar a performance do banco e a integridade da paginação?". O problema enfrentado hoje na aplicação é o cenário ideal para um quadro branco em entrevista, mostrando como subqueries, views indexadas no postgres, ou até campos consolidados de saldo no momento do pagamento na ordem de serviço ajudam a resolver gargalos de agregação em tempo real.

---

# 20. Definition of Done

Este projeto alcançará estabilidade madura como portfólio quando:
1. Puder ser provisionado localmente por meio de documentação fiel e `.env.example`.
2. As operações core (Cadastro, Login, Logout) ocorrerem sem engasgos na rede (requests limpos e com cookies expurgados corretamente).
3. Relatórios/Buscas não apresentarem problemas de N+1 (agregando dados localmente) e delegarem o trabalho sujo corretamente para o PostgreSQL via Prisma.
4. Incluir algum suíte rudimentar de CI (GitHub Actions).
