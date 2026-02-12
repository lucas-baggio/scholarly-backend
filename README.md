# Scholarly - Sistema de Gestão de Reservas de Laboratórios e Salas

## Introdução

Scholarly é um sistema de backend desenvolvido para resolver o problema crítico de conflitos de horários em ambientes escolares. A plataforma permite que professores reservem slots de tempo vinculados às suas disciplinas em laboratórios e salas de aula, garantindo disponibilidade de recursos e eliminating conflitos de agendamento.

A solução propõe uma arquitetura escalável que separa claramente as camadas de domínio, aplicação, infraestrutura e apresentação, aderindo rigorosamente aos princípios de Clean Architecture e Domain-Driven Design. Isso garante manutenibilidade, testabilidade e flexibilidade para evolução futura do sistema.

## Arquitetura

O projeto segue a arquitetura em camadas de Clean Architecture, com separação clara de responsabilidades:

### Camada de Domínio (Domain)

Contém as entidades de negócio, interfaces de repositórios e exceções de domínio. Esta camada é agnóstica a frameworks e tecnologias, representando as regras de negócio puras.

- **Entidades**: Definem os agregados do domínio (User, Subject, ScheduleSlot)
- **Repositórios (Interfaces)**: Definem contratos para persistência sem implementação concreta
- **Exceções de Domínio**: Erros específicos do negócio (UserInactiveException, UserNotAssignedToSubjectException)

### Camada de Aplicação (Application)

Implementa os Casos de Uso (Use Cases) que orquestram a lógica de negócio. Esta camada funciona como intermediária entre a apresentação e o domínio.

- **Use Cases**: Encapsulam operações específicas (CreateUserUseCase, DeactivateUserUseCase, GetUserByIdUseCase, ListActiveUsersUseCase, AuthenticateUserUseCase, CreateSchoolUseCase, etc.)
- **Data Transfer Objects (DTOs)**: Definem o contrato de entrada/saída para serviços, implementando validação via class-validator
- **Serviços de Aplicação**: Coordenam operações que envolvem múltiplas entidades

### Camada de Infraestrutura (Infrastructure)

Implementa os detalhes técnicos, incluindo persistência, criptografia e integrações externas. Utiliza padrão de Inversão de Controle através de Dependency Injection.

- **Repositórios em Memória**: Implementação leve para desacoplamento de banco de dados, ideal para prototipagem e testes unitários
- **Hash Service (Bcrypt)**: Implementação concreta de criptografia de senhas
- **Database Abstraction**: Permite troca futura de tecnologia de persistência sem impactar camadas superiores

### Camada de Apresentação (Presentation)

Expõe APIs REST através de Controllers NestJS. Responsável por receber requisições HTTP, invocar casos de uso e retornar respostas.

- **Controllers**: Endpoints REST (UserController, AuthController, SchoolController, HealthController)
- **Validação de Entrada**: Através de pipes NestJS e class-validator
- **Tratamento de Erros**: Mapeamento de exceções de domínio para respostas HTTP adequadas
- **Autenticação**: JWT com Passport; guards e decorators para rotas protegidas

### Inversão de Dependência

O projeto utiliza injeção de dependências do NestJS para desacoplar componentes. Interfaces de repositórios são injetadas em use cases, permitindo:

- Testes unitários sem dependências de banco de dados
- Troca flexível de implementações (in-memory para PostgreSQL, por exemplo)
- Maior testabilidade e flexibilidade arquitetural

## Modelagem de Dados

### Diagrama Entidade-Relacionamento

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│ ┌──────────────────┐         ┌──────────────────┐                   │
│ │      User        │         │     Subject      │                   │
│ ├──────────────────┤         ├──────────────────┤                   │
│ │ id (PK)          │         │ id (PK)          │                   │
│ │ name             │         │ name             │                   │
│ │ email (UNIQUE)   │         │ isActive         │                   │
│ │ password (hash)  │         └──────────────────┘                   │
│ │ isActive         │                                                │
│ └──────────────────┘                                                │
│          │                                                          │
│          │ 1:N (N:N through junction table)                         │
│          │                                                          │
│ ┌─────────────────────────────────────────────────────────────┐     │
│ │            ScheduleSlot                                     │     │
│ ├─────────────────────────────────────────────────────────────┤     │
│ │ id (PK)                                                     │     │
│ │ subjectId (FK)                                              │     │
│ │ teacherId (FK -> User.id)                                   │     │
│ │ date                                                        │     │
│ │ startTime                                                   │     │
│ │ endTime                                                     │     │
│ │ status (AVAILABLE, RESERVED, CANCELLED)                     │     │
│ └─────────────────────────────────────────────────────────────┘     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
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

#### Subject (Disciplina)

| Campo    | Tipo    | Restrições       | Descrição                         |
| -------- | ------- | ---------------- | --------------------------------- |
| id       | UUID    | Primary Key      | Identificador único da disciplina |
| name     | String  | Required, Min: 3 | Nome da disciplina                |
| isActive | Boolean | Default: true    | Disponibilidade da disciplina     |

#### Allocation (Alocação)

| Campo     | Tipo | Restrições  | Descrição                       |
| --------- | ---- | ----------- | ------------------------------- |
| id        | UUID | Primary Key | Identificador único da alocação |
| teacherId | UUID | Foreign Key | Referência para User            |
| schoolId  | UUID | Foreign Key | Referência para School          |
| subjectId | UUID | Foreign Key | Referência para Subject         |
| createAt  | Date | Required    | Data de criação da alocação     |

#### School (Escola)

Módulo acadêmico: entidade School com operações de criação, listagem e busca por ID ou por admin.

#### ScheduleSlot (Slot de Agendamento)

| Campo     | Tipo | Restrições                     | Descrição                     |
| --------- | ---- | ------------------------------ | ----------------------------- |
| id        | UUID | Primary Key                    | Identificador único do slot   |
| subjectId | UUID | Foreign Key                    | Referência para Subject       |
| teacherId | UUID | Foreign Key                    | Referência para User          |
| date      | Date | Required                       | Data do agendamento           |
| startTime | Time | Required                       | Horário inicial (formato 24h) |
| endTime   | Time | Required                       | Horário final (formato 24h)   |
| status    | Enum | AVAILABLE, RESERVED, CANCELLED | Status do slot                |

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

### Lógica de Agendamento

8. **Prevenção de Conflitos Horários**: Um slot de laboratório/sala não pode possuir mais de uma reserva no mesmo intervalo de tempo. O sistema valida sobreposição temporal.

9. **Vinculação de Disciplina**: Professores podem reservar slots apenas para disciplinas às quais estão vinculados. Tentativas de reserva para disciplinas não atribuídas resultam em UserNotAssignedToSubjectException.

10. **Limite de Atividade**: Professores inativos (isActive = false) não podem realizar novas reservas. Tentativas resultam em UserInactiveException.

11. **Integridade Referencial**: Ao desativar um professor, todos os seus slots de agendamento associados devem ser cancelados ou realocados conforme política da instituição.

## Tecnologias

| Tecnologia        | Versão  | Propósito                                              |
| ----------------- | ------- | ------------------------------------------------------ |
| NestJS            | 11.0.1+ | Framework backend Node.js com injeção de dependência   |
| TypeScript        | Latest  | Linguagem tipada para maior segurança e documentação   |
| Bcrypt            | 6.0.0+  | Algoritmo de hashing criptográfico para senhas         |
| class-validator   | 0.14.3+ | Validação declarativa de DTOs e entidades              |
| class-transformer | 0.5.1+  | Transformação de payloads JSON para classes TypeScript |
| Jest              | 30.0.0+ | Framework de testes unitários com coverage reporting   |
| Supertest         | 7.0.0+  | HTTP assertions para testes E2E                        |
| ESLint            | 9.18.0+ | Linting e enforcing de padrões de código               |
| Prettier          | 3.4.2+  | Formatação automática de código                        |
| @nestjs/jwt       | 11.x    | Geração e validação de tokens JWT                      |
| @nestjs/passport  | 11.x    | Estratégias de autenticação (JWT)                      |
| passport-jwt      | 4.x     | Estratégia Passport para JWT                           |

## Instalação e Configuração

### Pré-requisitos

- Node.js 18.x ou superior
- npm 9.x ou superior

### Setup do Projeto

```bash
npm install
```

### Variáveis de Ambiente

| Variável   | Obrigatório | Descrição                                                                 |
| ---------- | ----------- | ------------------------------------------------------------------------- |
| PORT       | Não         | Porta do servidor (default: 3000)                                         |
| JWT_SECRET | Produção    | Chave secreta para assinatura do JWT. Em desenvolvimento usa valor padrão |

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

### Health

| Método | Rota    | Descrição    |
| ------ | ------- | ------------ |
| GET    | /health | Health check |

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

Testes end-to-end validam fluxos completos de requisição HTTP:

```bash
npm run test:e2e
```

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

### Manipulaçãode Erros

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

- Integração com banco de dados PostgreSQL
- Aplicar JwtAuthGuard em rotas que exigem autenticação
- WebSocket para notificações em tempo real de disponibilidade
- Relatórios e analytics de utilização de recursos
- Sincronização com calendários institucionais (Google Calendar, Outlook)

## Licença

UNLICENSED

## Contato e Suporte

Para dúvidas sobre a arquitetura ou padrões implementados, consulte a documentação de Clean Architecture de Robert C. Martin ou entre em contato com o time de backend.
