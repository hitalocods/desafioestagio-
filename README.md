# 🛒 NovaStore — E-commerce & Booking Full Stack

Solução completa desenvolvida para o **Desafio Técnico Full Stack (E-commerce)**, contemplando **todos os requisitos obrigatórios** e **todos os diferenciais técnicos e funcionais extras** propostos no enunciado.

---

## ✨ Destaques e Diferenciais Implementados

### 1. Diferencial Funcional Extra: Produtos Físicos + Booking com Check-in & Experiência Flagship Store
O catálogo suporta dois formatos de compra integrados na mesma sacola, com interface de loja real de alto padrão:
- **Produtos Físicos (`PHYSICAL`)**: Eletrônicos, periféricos, wearables e acessórios com validação e baixa automática de estoque.
- **Reservas / Experiências (`BOOKING`)**: Hospedagem em cabana alpina, reserva de estúdio fotográfico e mentoria ao vivo, permitindo selecionar **Data de Check-in**, **Horário disponível (`availableSlots`)**, **Quantidade de participantes/hóspedes** e **Observações especiais**.
- **UX de E-commerce Premium & Responsivo**:
  - **Quick View Modal**: Visualização rápida de detalhes do produto, cálculo de desconto no PIX (10% OFF), parcelamento em 12x sem juros e seletor de quantidade.
  - **Filtros por Categoria, Ordenação e Lista de Desejos (Favoritos)**: Ordenação por menor/maior preço e avaliação, pílulas de categorias dinâmicas e favoritos.
  - **Sacola com Barra de Progresso de Frete Grátis e Cupons Promocionais**: Cupons interativos (`BEMVINDO10`, `DEV15`, `NOVASTORE5`) e barra sticky no mobile.
  - **Painel "Meus Pedidos" em Tempo Real**: Consulta direta ao banco de dados (`GET /pedidos`) mostrando todas as compras realizadas e link para abrir o e-mail de confirmação enviado.

### 2. Diferenciais Técnicos Utilizados
| Tecnologia / Biblioteca | Onde e Como foi Aplicada |
| :--- | :--- |
| **Next.js 15 (App Router) + React 19** | Front-end moderno, componentizado e tipado com TypeScript (`frontend/`). |
| **Tailwind CSS** | Interface responsiva, feedback visual imediato, badges por tipo de produto, drawer lateral do carrinho e modais acessíveis. |
| **TanStack Query (`@tanstack/react-query`)** | Gerenciamento de estado assíncrono do catálogo e do carrinho (`useProductsQuery`, `useCartQuery`, `useCartMutations`) com atualização imediata de cache. |
| **React Hook Form + Zod** | Validação declarativa e rigorosa tanto no **Modal de Agendamento (Booking)** quanto no **Modal de Checkout**. |
| **React Custom Hooks** | Hooks dedicados: `useSessionId`, `useDebounce`, `useProductsQuery`, `useCartQuery`, `useCartMutations`. |
| **NestJS (Node.js Framework)** | Arquitetura modular no back-end (`ProductsModule`, `CartModule`, `OrdersModule`, `MailModule`) com documentação Swagger automática. |
| **TypeORM + Banco Relacional** | Mapeamento objeto-relacional com entidades `Product`, `Order` e `OrderItem`, gravação transacional (`DataSource.transaction`) e Seed automático na inicialização. Suporta **PostgreSQL**, **MySQL** ou **SQLite Relacional (Zero-Config)** via `.env`. |
| **Zod Validation Pipe (Back-end)** | Validação de entrada nos endpoints `POST /carrinho`, `PUT /carrinho` e `POST /finalizar-compra`. |
| **Segurança** | Proteção de headers HTTP com **Helmet**, **Rate Limiting** contra abuso com `@nestjs/throttler`, **CORS** restrito com suporte a cookies `httpOnly` e validação estrita de payloads. |
| **Envio de E-mail com Preview Real** | Integração com **Nodemailer** + **Ethereal SMTP**: ao finalizar a compra, um e-mail HTML completo é disparado e o link de visualização (`previewUrl`) é exibido diretamente na tela de sucesso do pedido! |

---

## 🔌 Endpoints da API RESTful (`http://localhost:3001`)

A documentação interativa **Swagger / OpenAPI** fica disponível em:
👉 **`http://localhost:3001/api-docs`**

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/produtos` | Retorna a lista de produtos e serviços disponíveis (aceita query params opcionais `?type=PHYSICAL\|BOOKING&search=...`). |
| `GET` | `/carrinho` | Retorna o estado atual do carrinho da sessão (`items`, `totalItems`, `totalAmount`). |
| `POST` | `/carrinho` | Adiciona um produto físico ou reserva (com objeto `booking: { checkInDate, checkInTime, guests, notes }`) ao carrinho. |
| `PUT` | `/carrinho` | Atualiza a quantidade de um item no carrinho ou o remove caso `quantity` seja `0`. |
| `DELETE` | `/carrinho/:itemId` | Remove um item individualmente do carrinho. |
| `POST` | `/finalizar-compra` | Valida estoque em transação no banco relacional, registra a venda (`orders` + `order_items`), envia o e-mail de confirmação e esvazia o carrinho. |
| `GET` | `/pedidos` | Lista o histórico de todas as vendas registradas no banco de dados. |

---

## 🚀 Como Executar o Projeto em Localhost

### Pré-requisitos
- **Node.js** (v18+ ou v20/v22/v24) e **npm** instalados.
- *(Opcional)* **Docker** caso queira subir uma instância PostgreSQL via `docker-compose up -d`. Por padrão, o projeto já vem configurado com **SQLite Relacional persistido em arquivo (`./data/ecommerce.sqlite`) via TypeORM**, funcionando imediatamente sem precisar instalar SGBD externo!

### Passo 1: Instalar as dependências (caso ainda não estejam instaladas)
Na raiz do projeto (`c:\desafio`):
```bash
npm run install:all
```

### Passo 2: Iniciar o Back-end (Porta `3001`)
Em um terminal, execute:
```bash
cd backend
npm run start:dev
```
- O servidor NestJS iniciará em **`http://localhost:3001`**.
- O **Seed Automático** criará as tabelas relacionais e populará 8 itens (produtos físicos + experiências de booking) automaticamente na primeira execução.
- Acesse **`http://localhost:3001/api-docs`** para explorar o Swagger.

### Passo 3: Iniciar o Front-end (Porta `3000`)
Em outro terminal, execute:
```bash
cd frontend
npm run dev
```
- Abra **`http://localhost:3000`** no seu navegador.

---

## 🐘 (Opcional) Usando PostgreSQL ou MySQL
Caso deseje conectar a um servidor PostgreSQL ou MySQL externo (ou subir o `docker-compose.yml` incluso na raiz com `docker compose up -d`), basta editar o arquivo `backend/.env`:

```env
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=desafio_ecommerce
```

---

## 🧪 Executando os Testes Automatizados
O back-end conta com testes de integração (`Supertest` + `Jest`) cobrindo listagem de produtos, adição de produtos físicos e bookings ao carrinho, atualização de quantidades e finalização completa da compra com persistência e disparo de e-mail:

```bash
cd backend
npm test
```

