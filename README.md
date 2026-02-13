# Scholarly - Sistema de Gestão de Reservas de Laboratórios e Salas

## Introdução

Scholarly é um sistema de backend desenvolvido para resolver o problema crítico de conflitos de horários em ambientes escolares. A plataforma permite que professores reservem slots de tempo vinculados às suas disciplinas em laboratórios e salas de aula, garantindo disponibilidade de recursos e eliminando conflitos de agendamento.

A solução propõe uma arquitetura escalável que separa claramente as camadas de domínio, aplicação, infraestrutura e apresentação, aderindo aos princípios de Clean Architecture e Domain-Driven Design. Isso garante manutenibilidade, testabilidade e flexibilidade para evolução futura do sistema.

## Arquitetura

O projeto segue a arquitetura em camadas de Clean Architecture, com separação clara de responsabilidades:

### Camada de Domínio (Domain)

Contém as entidades de negócio, interfaces de repositórios e exceções de domínio. Esta camada é agnóstica a frameworks e tecnologias, representando as regras de negócio puras.

- **Entidades**: Definem os agregados do domínio (User, School, Subject, Allocation, TimeSlot, Schedule)
- **Repositórios (Interfaces)**: Definem contratos para persistência sem implementação concreta
- **Exceções de Domínio**: Erros específicos do negócio (AdminRequiredException, SchoolInactiveException)

### Camada de Aplicação (Application)

Implementa os Casos de Uso (Use Cases) que orquestram a lógica de negócio. Esta camada funciona como intermediária entre a apresentação e o domínio.

- **Use Cases**: Encapsulam operações específicas (CreateUserUseCase, AuthenticateUserUseCase, CreateSchoolUseCase, CreateSubjectUseCase, CreateAllocationUseCase, CreateTimeSlotUseCase, CreateScheduleUseCase, ListSchoolGridUseCase, etc.)
- **Data Transfer Objects (DTOs)**: Definem o contrato de entrada/saída para serviços, implementando validação via class-validator
- **Serviços de Aplicação**: Coordenam operações que envolvem múltiplas entidades

### Camada de Infraestrutura (Infrastructure)

Implementa os detalhes técnicos, incluindo persistência, criptografia e integrações externas. Utiliza padrão de Inversão de Controle através de Dependency Injection.

- **Repositórios em Memória**: Implementação leve para desacoplamento, usada em testes unitários
- **Repositórios Prisma (PostgreSQL)**: Persistência real com Prisma ORM; mappers convertem entidades de domínio ↔ modelos Prisma
- **Hash Service (Bcrypt)**: Implementação concreta de criptografia de senhas
- **Database Abstraction**: Interfaces de repositório permitem troca entre in-memory e PostgreSQL via configuração

### Camada de Apresentação (Presentation)

Expõe APIs REST através de Controllers NestJS. Responsável por receber requisições HTTP, invocar casos de uso e retornar respostas.

- **Controllers**: Endpoints REST (UserController, AuthController, SchoolController, SubjectController, AllocationController, TimeSlotController, ScheduleController, HealthController)
- **Validação de Entrada**: Através de pipes NestJS e class-validator
- **Tratamento de Erros**: Mapeamento de exceções de domínio para respostas HTTP adequadas
- **Autenticação**: JWT com Passport; guards e decorator `@CurrentUser()` para rotas protegidas

### Inversão de Dependência

O projeto utiliza injeção de dependências do NestJS para desacoplar componentes. Interfaces de repositórios são injetadas em use cases, permitindo:

- Testes unitários sem dependências de banco de dados
- Troca flexível de implementações (in-memory para PostgreSQL, por exemplo)
- Maior testabilidade e flexibilidade arquitetural

## Modelagem de Dados

### Diagrama Entidade-Relacionamento

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  User (id, name, email UNIQUE, password, role ADMIN|TEACHER, isActive, ...)  │
│       │                                                                      │
│       │ 1:1 (admin)                                                          │
│       ▼                                                                      │
│  School (id, name, adminId UNIQUE, isActive, ...)  ◄── 1 ADM por escola     │
│       │                                                                      │
│       ├── 1:N Subject (id, name, schoolId, isActive, ...)                    │
│       ├── 1:N TimeSlot (id, schoolId, name, dayOfWeek, startMinutes, ...)    │
│       └── 1:N Allocation (teacherId, schoolId, subjectId)                    │
│                    │                                                         │
│  User (teacher) ───┘ (Professor em múltiplas escolas via Allocation)         │
│                    │                                                         │
│                    └── 1:N Schedule (allocationId, timeSlotId)               │
│                              │                                               │
│  TimeSlot ───────────────────┘ (grade horária: quem dá aula em qual slot)    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Entidades Principais

#### User (Professor / Admin)

| Campo     | Tipo     | Restrições                     | Descrição                                  |
| --------- | -------- | ------------------------------ | ------------------------------------------ |
| id        | UUID     | Primary Key                    | Identificador único do usuário             |
| name      | String   | Required                       | Nome do usuário                            |
| email     | String   | Required, UNIQUE, Email Format | Email único para autenticação              |
| password  | String   | Required, Min: 6               | Senha criptografada com Bcrypt             |
| role      | Enum     | ADMIN, TEACHER (default)       | Papel do usuário no sistema                |
| isActive  | Boolean  | Default: true                  | Status ativo/inativo                       |
| subjects  | String[] | Optional                       | Identificadores das disciplinas vinculadas |
| schoolIds | String[] | Optional                       | Identificadores das escolas vinculadas     |
| createdAt | Date     | Optional                       | Data de criação                            |

#### School (Escola)

| Campo     | Tipo     | Restrições          | Descrição                                |
| --------- | -------- | ------------------- | ---------------------------------------- |
| id        | UUID     | Primary Key         | Identificador único da escola            |
| name      | String   | Required            | Nome da escola                           |
| adminId   | UUID     | Foreign Key, UNIQUE | Um ADM por escola (referência para User) |
| isActive  | Boolean  | Default: true       | Escola ativa/inativa                     |
| createdAt | DateTime | Required            | Data de criação                          |

#### Subject (Disciplina)

| Campo     | Tipo     | Restrições    | Descrição                           |
| --------- | -------- | ------------- | ----------------------------------- |
| id        | UUID     | Primary Key   | Identificador único da disciplina   |
| name      | String   | Required      | Nome da disciplina                  |
| schoolId  | UUID     | Foreign Key   | Escola à qual a disciplina pertence |
| isActive  | Boolean  | Default: true | Disponibilidade da disciplina       |
| createdAt | DateTime | Required      | Data de criação                     |

#### Allocation (Alocação)

Vínculo Professor × Escola × Matéria. Um professor pode estar alocado em várias escolas e disciplinas.

| Campo     | Tipo     | Restrições  | Descrição                                 |
| --------- | -------- | ----------- | ----------------------------------------- |
| id        | UUID     | Primary Key | Identificador único da alocação           |
| teacherId | UUID     | Foreign Key | Referência para User (professor)          |
| schoolId  | UUID     | Foreign Key | Referência para School                    |
| subjectId | UUID     | Foreign Key | Referência para Subject (da mesma escola) |
| createdAt | DateTime | Required    | Data de criação da alocação               |

Constraint: `@@unique([teacherId, schoolId, subjectId])` — evita alocação duplicada.

#### TimeSlot (Slot de Horário)

Define um intervalo de tempo dentro de uma escola (ex.: “1ª aula 07:00–07:50”). Horários armazenados em minutos desde meia-noite para comparação segura.

| Campo            | Tipo   | Restrições  | Descrição                                |
| ---------------- | ------ | ----------- | ---------------------------------------- |
| id               | UUID   | Primary Key | Identificador único do slot              |
| schoolId         | UUID   | Foreign Key | Escola do slot                           |
| name             | String | Required    | Nome do slot (ex.: “1ª aula”)            |
| dayOfWeek        | Int    | 1–7         | Dia da semana (1 = segunda, 7 = domingo) |
| startTimeMinutes | Int    | Required    | Início em minutos desde meia-noite       |
| endTimeMinutes   | Int    | Required    | Fim em minutos (end > start)             |

Apenas o admin da escola pode criar TimeSlots.

#### Schedule (Agendamento)

Atribui uma alocação (professor + escola + matéria) a um TimeSlot, formando a grade horária.

| Campo        | Tipo | Restrições  | Descrição                           |
| ------------ | ---- | ----------- | ----------------------------------- |
| id           | UUID | Primary Key | Identificador único                 |
| allocationId | UUID | Foreign Key | Alocação (professor/escola/matéria) |
| timeSlotId   | UUID | Foreign Key | Slot de horário                     |

Constraint: `@@unique([allocationId, timeSlotId])`. Regras de negócio: mesma escola; slot livre na escola; sem conflito de horário do professor no mesmo dia.

## Regras de Negócio

### Validação de Dados

1. **E-mail Único**: Cada professor deve possuir um e-mail único no sistema. Tentativas de registro com e-mail duplicado são rejeitadas com erro 409 Conflict.

2. **Formatação de E-mail**: O sistema valida o formato RFC 5322 de endereços de e-mail através de class-validator.

3. **Força de Senha**: Senhas devem conter no mínimo 6 caracteres para garantir critério mínimo de segurança.

### Criptografia e Segurança

4. **Bcrypt Hashing**: Todas as senhas são criptografadas com Bcrypt (salt rounds: 10) antes de persistência. Senhas não são armazenadas em plain text.

5. **Senha Imutável em Recuperação**: Após criação, a senha é apenas comparada durante autenticação, nunca retornada em respostas de API.

6. **Autenticação JWT**: Login via `POST /auth/login` (email + senha). Resposta inclui `accessToken` (JWT, expiração 7 dias) e dados do usuário. Rotas protegidas usam o header `Authorization: Bearer <token>`.

7. **Papéis (Role)**: Usuários podem ser `ADMIN` ou `TEACHER`. Vinculação a escolas via `schoolIds` e método `assignToSchool`.

### Lógica Acadêmica e Agendamento

8. **Um ADM por escola**: Cada escola possui um único administrador (`School.adminId` único). A criação de escola exige um User com role ADMIN.

9. **Disciplinas por escola**: Subject pertence a uma School; apenas escolas ativas podem ter disciplinas. Criação de Subject valida escola existente e ativa (SchoolInactiveException se inativa).

10. **Alocação Professor × Escola × Matéria**: Allocation vincula teacherId, schoolId e subjectId. Validações: professor existe, escola ativa, disciplina pertence à escola, sem duplicata (mesmo teacher/school/subject). Ao criar alocação, o User é atualizado com `assignToSchool` e `assignToSubject`.

11. **TimeSlot**: Apenas o admin da escola pode criar slots de horário. Horários em minutos (HH:mm convertido) para comparação segura; dayOfWeek 1–7; startTime < endTime.

12. **Schedule (grade horária)**: Vincula uma Allocation a um TimeSlot. Regras: TimeSlot e Allocation da mesma escola; slot não pode estar ocupado por outra alocação; mesmo professor não pode ter dois agendamentos no mesmo dia/horário (conflito global). A grade da escola é consultada via `GET /school-grid/:schoolId`.

## Tecnologias

| Tecnologia        | Versão  | Propósito                                              |
| ----------------- | ------- | ------------------------------------------------------ |
| NestJS            | 11.0.1+ | Framework backend Node.js com injeção de dependência   |
| TypeScript        | 5.7+    | Linguagem tipada para maior segurança e documentação   |
| PostgreSQL        | 16      | Banco de dados relacional (Docker)                     |
| Prisma ORM        | 7.x     | Camada de persistência, migrations e Prisma Client     |
| Bcrypt            | 6.0.0+  | Algoritmo de hashing criptográfico para senhas         |
| class-validator   | 0.14.3+ | Validação declarativa de DTOs e entidades              |
| class-transformer | 0.5.1+  | Transformação de payloads JSON para classes TypeScript |
| Jest              | 30.0.0+ | Framework de testes unitários com coverage reporting   |
| Supertest         | 7.0.0+  | HTTP assertions para testes E2E                        |
| ESLint            | 9.18.0+ | Linting e enforcing de padrões de código               |
| Prettier          | 3.4.2+  | Formatação automática de código                        |
| dotenv            | 17.x    | Variáveis de ambiente (.env)                           |
| @nestjs/jwt       | 11.x    | Geração e validação de tokens JWT                      |
| @nestjs/passport  | 11.x    | Estratégias de autenticação (JWT)                      |
| passport-jwt      | 4.x     | Estratégia Passport para JWT                           |

## Instalação e Configuração

### Pré-requisitos

- Node.js 18.x ou superior
- npm 9.x ou superior
- Docker e Docker Compose (para PostgreSQL e Adminer)

### Setup do Projeto

```bash
npm install
```

### Banco de Dados (PostgreSQL + Prisma)

O projeto usa PostgreSQL via Docker e Prisma ORM. Opcionalmente, use Adminer para interface visual.

```bash
# Subir PostgreSQL e Adminer (porta 5432 e 8080)
docker-compose up -d

# Copiar variáveis de ambiente (ajuste DATABASE_URL se necessário)
cp .env.example .env

# Aplicar migrations e criar tabelas
npm run db:migrate

# Popular dados iniciais (admin + escola de teste)
npm run db:seed
```

Scripts úteis: `npm run db:studio` (Prisma Studio), `npm run db:seed` (re-executar seed).

### Variáveis de Ambiente

Copie `.env.example` para `.env` e ajuste se necessário:

| Variável     | Obrigatório | Descrição                                                                                                                                   |
| ------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| DATABASE_URL | Sim\*       | URL de conexão PostgreSQL (ex.: `postgresql://app:secret@localhost:5432/laboratorio`). \*Obrigatório para migrate/seed e para usar o banco. |
| PORT         | Não         | Porta do servidor (default: 3000)                                                                                                           |
| JWT_SECRET   | Produção    | Chave secreta para assinatura do JWT. Em desenvolvimento usa valor padrão                                                                   |

**Sem `DATABASE_URL`:** a aplicação sobe usando repositórios em memória (não precisa de Docker/PostgreSQL). O health retorna `database: "disconnected"`.

### Compilação

```bash
# Build para produção
npm run build

# Modo watch para desenvolvimento
npm run start:dev

# Production build e execução
npm run start:prod
```

### Lint

```bash
npm run lint
```

## API (Endpoints)

Base URL: `http://localhost:3000` (ou a porta configurada em `PORT`).

### Autenticação

| Método | Rota        | Descrição                  | Body / Headers            |
| ------ | ----------- | -------------------------- | ------------------------- |
| POST   | /auth/login | Login (retorna JWT e user) | `{ "email", "password" }` |

Resposta de sucesso: `{ "accessToken": "<JWT>", "user": { "id", "name", "email", "role" } }`.

### Usuários

| Método | Rota       | Descrição              | Body / Observação                                                     |
| ------ | ---------- | ---------------------- | --------------------------------------------------------------------- |
| POST   | /users     | Criar usuário          | `{ "name", "email", "password", "role?", "subjects?", "schoolIds?" }` |
| GET    | /users     | Listar usuários ativos | Resposta: array com id, name, email, role, subjects, schoolIds        |
| GET    | /users/:id | Buscar usuário por ID  | Resposta: id, name, email, role, isActive, subjects, schoolIds        |
| DELETE | /users/:id | Desativar usuário      | 204 No Content                                                        |

### Escolas (Academic)

| Método | Rota                    | Descrição               |
| ------ | ----------------------- | ----------------------- |
| POST   | /schools                | Criar escola            |
| GET    | /schools                | Listar escolas ativas   |
| GET    | /schools/:id            | Buscar escola por ID    |
| GET    | /schools/admin/:adminId | Escolas por ID do admin |

### Disciplinas (Subjects)

| Método | Rota                       | Descrição                               |
| ------ | -------------------------- | --------------------------------------- |
| POST   | /subjects                  | Criar disciplina (body: name, schoolId) |
| GET    | /subjects/school/:schoolId | Listar disciplinas por escola           |

### Alocações (Allocations)

| Método | Rota                            | Descrição                                       |
| ------ | ------------------------------- | ----------------------------------------------- |
| POST   | /allocations                    | Criar alocação (teacherId, schoolId, subjectId) |
| GET    | /allocations/teacher/:teacherId | Listar alocações do professor                   |

### Slots de Horário e Grade (Scheduling)

| Método | Rota                   | Descrição                                                                                            |
| ------ | ---------------------- | ---------------------------------------------------------------------------------------------------- |
| POST   | /time-slots            | Criar slot de horário (schoolId, name, dayOfWeek, startTime, endTime HH:mm). Apenas admin da escola. |
| POST   | /schedules             | Criar agendamento (allocationId, timeSlotId)                                                         |
| GET    | /school-grid/:schoolId | Grade horária da escola                                                                              |

### Health

| Método | Rota    | Descrição                                                                   |
| ------ | ------- | --------------------------------------------------------------------------- |
| GET    | /health | Health check (inclui verificação de conexão com o banco quando configurado) |

Para rotas protegidas (quando aplicável), envie o header: `Authorization: Bearer <accessToken>`.

## Testes

A suite de testes unitários é executada com Jest. Todos os use cases possuem cobertura de testes para garantir comportamento esperado e regressões.

```bash
# Executar suite de testes unitários
npm test

# Testes em modo watch durante desenvolvimento
npm test:watch

# Relatório de cobertura de código
npm test:cov

# Debug de testes
npm run test:debug
```

### Testes E2E

Testes end-to-end validam o fluxo completo (Presentation + Use Cases + Infrastructure), incluindo caminho feliz (Auth → Schools → Subjects → Allocations → TimeSlots → Schedules → school-grid) e caminho infeliz (ex.: agendar em slot ocupado → 409). O app de teste usa `ValidationPipe` e, quando `DATABASE_URL` está definida, limpa as tabelas antes da suíte para evitar conflito de unicidade.

```bash
# Executar E2E
npm run test:e2e

# E2E com cobertura (Controllers e Mappers em presentation/ e infrastructure/persistence/)
npm run test:cov:e2e

# Cobertura unitária + E2E
npm run test:cov:all
```

Com `DATABASE_URL` configurada, os repositórios Prisma e os mappers (toDomain/toPersistence) são exercitados; sem ela, a suíte usa repositórios em memória.

## Padrões de Desenvolvimento

### Criação de Novos Use Cases

1. Defina a entidade no diretório `domain/`
2. Crie a interface de repositório em `domain/`
3. Implemente a lógica de caso de uso em `application/use-cases/`
4. Implemente o repositório em `infrastructure/persistence/`
5. Exponha o caso de uso em `presentation/controllers/`
6. Adicione validação através de DTOs em `application/dtos/`
7. Escreva testes unitários em `test/`

### Validação

Utilize class-validator decorators para validação declarativa:

```typescript
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

### Manipulação de Erros

Defina exceções de domínio em `domain/exceptions/` e mapeie para respostas HTTP no controller:

```typescript
try {
  await this.createUserUseCase.execute(createUserDto);
} catch (error) {
  if (error instanceof UserInactiveException) {
    throw new BadRequestException(error.message);
  }
  throw error;
}
```

## Roadmap

- Persistência PostgreSQL com Prisma (schema, migrations, seed, mappers e repositórios reais)
- Aplicar JwtAuthGuard em rotas que exigem autenticação
- Health check com verificação de conexão ao banco
- WebSocket para notificações em tempo real de disponibilidade
- Relatórios e analytics de utilização de recursos
- Sincronização com calendários institucionais (Google Calendar, Outlook)

## Licença

UNLICENSED

## Contato e Suporte

Para dúvidas sobre a arquitetura ou padrões implementados, consulte a documentação de Clean Architecture de Robert C. Martin ou entre em contato com o time de backend.
