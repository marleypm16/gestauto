# 🎨 Documento de Estilização & Design System — GestAuto (Eixo)
### *Guia Visual & Prompts Estruturados para Geração de Telas no Stitch IA / Ferramentas Generativas de UI*

---

## 1. Conceito & Direção de Arte

* **Público-Alvo:** Donos de estúdios de estética automotiva, oficinas de detalhamento (detailing), vitrificação, PPF e centros automotivos de alto padrão.
* **Ambiente de Uso:** Operação em chão de oficina (tablets, iPads e smartphones de funcionários com mãos com produtos/luvas) e recepção/escritório (desktop/notebook do proprietário com iluminação LED forte de estúdio).
* **Atmosfera Visual (Theme):** **"Dark Technical Luxury / Garage Atelier"**.
  * Foco em **Dark Mode prioritário** (o padrão ouro na cultura estética automotiva, que valoriza o brilho dos carros, reduz o cansaço visual e transmite autoridade técnica).
  * Linhas precisas, superfícies em grafite/antracite profundo, bordas sutis com micro-brilho e cores de destaque cirúrgicas (ouro titânio/âmbar e verde WhatsApp para conversão).
  * Tipografia técnica e crachás automotivos de alta legibilidade (ex.: placas no padrão Mercosul com tipografia monoespaçada).

---

## 2. Paleta de Cores (Design Tokens & Tailwind)

### 2.1 Superfícies e Fundos (Dark Canvas)
| Token | Cor Hex | Tailwind Equivalente | Uso Principal |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `#0B0E14` | `bg-[#0B0E14]` / `bg-slate-950` | Fundo geral da aplicação |
| **Card / Surface Default** | `#121722` | `bg-[#121722]` | Fundo dos cards, tabelas e modais |
| **Surface Elevated / Hover** | `#1A2234` | `bg-[#1A2234]` | Hover de cards, dropdowns e inputs ativos |
| **Border / Divider** | `#263047` | `border-[#263047]` | Bordas elegantes, finas (1px) |
| **Subtle Border Glow** | `#374567` | `border-[#374567]` | Bordas com foco ou cards ativos |

### 2.2 Cores de Marca & Ação Primária
| Token | Cor Hex | Tailwind Equivalente | Uso Principal |
| :--- | :--- | :--- | :--- |
| **Primary Amber / Gold** | `#F59E0B` | `bg-amber-500` / `text-amber-400` | Botões primários, CTA de Check-in, destaques VIP |
| **Primary Hover** | `#D97706` | `bg-amber-600` | Estado ativo/hover de botões primários |
| **WhatsApp Glow** | `#25D366` | `bg-[#25D366]` / `text-[#25D366]` | Botões de recall e envio de mensagem no WhatsApp |
| **WhatsApp Hover** | `#1EBE5D` | `bg-[#1EBE5D]` | Hover de disparos do WhatsApp |

### 2.3 Status do Ciclo Operacional (Ordem de Serviço & Pátio)
| Status OS | Cor Base | Background (15% opacity) | Borda | Significado Operacional |
| :--- | :--- | :--- | :--- | :--- |
| **AGENDADO** | `#38BDF8` (Sky) | `bg-sky-500/10` | `border-sky-500/30` | Marcado para o futuro |
| **AGUARDANDO_INICIO**| `#F59E0B` (Amber) | `bg-amber-500/10` | `border-amber-500/30` | Carro está no pátio esperando vaga |
| **EM_EXECUCAO** | `#A855F7` (Purple) | `bg-purple-500/10` | `border-purple-500/30` | No box sendo trabalhado *(com pulse dot)* |
| **PRONTO_RETIRADA** | `#10B981` (Emerald) | `bg-emerald-500/10` | `border-emerald-500/30` | Carro finalizado brilhando, pronto para buscar |
| **ENTREGUE** | `#64748B` (Slate) | `bg-slate-500/10` | `border-slate-500/30` | Entregue e recebido |
| **CANCELADO** | `#EF4444` (Red) | `bg-red-500/10` | `border-red-500/30` | Desistência ou cancelamento |

---

## 3. Tipografia & Escala Visual

* **Fonte Principal (Interface):** `Inter` ou `Plus Jakarta Sans` — moderna, limpa, legibilidade instantânea em números e rótulos.
* **Fonte Técnica (Placas, Valores & Códigos):** `JetBrains Mono` ou `Fira Code` — para valores em R$, placas automotivas e datas/horas.

### Hierarquia de Texto
* **H1 / Título da Página:** 24px a 28px (`text-2xl` / `text-3xl`), Font-Weight: `font-bold` (700), cor `#F8FAFC`.
* **H2 / Títulos de Seção & Cards:** 18px a 20px (`text-lg` / `text-xl`), Font-Weight: `font-semibold` (600), cor `#E2E8F0`.
* **Métricas / Big Numbers:** 28px a 36px (`text-3xl` / `text-4xl`), Font-Weight: `font-extrabold` (800), tracking tight (`tracking-tight`).
* **Body / Textos Gerais:** 14px (`text-sm`), Font-Weight: `font-normal` (400), cor `#94A3B8`.
* **Labels & Badges:** 11px a 12px (`text-xs`), Font-Weight: `font-medium` (500), tracking wide (`tracking-wider`), uppercase opcional para tags.

---

## 4. Componentes UI Chave (Design Tokens & Ergonomia)

### 4.1 Card de Carro no Pátio (Vehicle Box Card)
* **Estrutura:** 
  * Cabeçalho com Badge da Placa (estilo placa Mercosul: topo azul e fundo branco/cinza claro, ou badge preta com tipografia monoespaçada bold) + Badge de Status colorido com bolinha pulsante se em execução.
  * Título: Modelo do Carro (ex.: `Porsche 911 Carrera GTS` ou `Honda Civic Touring`).
  * Subtítulo: Nome do Cliente + Ícone de telefone/WhatsApp.
  * Lista de tags dos serviços executados (ex.: `[Polimento Técnico]` `[Vitrificação 3 Anos]`).
  * Rodapé com previsão de entrega (ex.: `Previsão: Hoje, 17:30`) e Botão de Ação Direta (ex.: `Avançar para Pronto` ou `Enviar WhatsApp`).
* **Ergonomia:** Alvo de toque mínimo de **44px** para facilitar o uso no tablet do estúdio.

### 4.2 Indicador de Métricas Rápidas (KPI Cards)
* 4 a 5 cards compactos no topo da Home:
  1. **Faturado Hoje (R$)** — com indicador verde de recebido.
  2. **A Receber (R$)** — pendências de pagamento.
  3. **Carros no Pátio** — contagem ao vivo com ícone de carro.
  4. **Pós-Venda Hoje** — contagem de clientes a contatar com badge vermelho/âmbar chamando ação.

### 4.3 Botão de Ação Primária de Alta Conversão ("Entrada Rápida / Check-in")
* Botão com preenchimento Âmbar Dourado (`bg-amber-500 hover:bg-amber-600 text-black font-bold`), ícone `+` ou de chave de carro, cantos arredondados (`rounded-xl`), sombra dourada sutil (`shadow-lg shadow-amber-500/20`).

### 4.4 Badge de Placa Automotiva (Mercosul Style)
* Pequena moldura com cantos arredondados, borda preta ou azul royal, faixa azul no topo com bandeira do Brasil em miniatura e letras monoespaçadas maiúsculas em preto sobre fundo branco (ou variante Dark Minimalist: fundo escuro com borda metálica e texto branco em mono).

---

## 5. Prompts Prontos para Stitch IA (Por Tela do Sistema)

Você pode copiar e colar os prompts abaixo diretamente no **Stitch IA** para gerar as telas com fidelidade milimétrica:

---

### 🖥️ Prompt 1: Dashboard Principal / Pátio do Dia (Home Screen)

```text
A sleek, high-end dark mode web application dashboard for a luxury automotive detailing and aesthetic studio named "GestAuto".

Theme & Styling:
- Ultra-dark theme: background #0B0E14, cards in #121722 with subtle 1px border in #263047.
- Color accents: Vibrant amber gold (#F59E0B) for primary actions, WhatsApp emerald (#25D366) for direct communication, and modern tech status colors.
- Modern sans-serif typography (Plus Jakarta Sans) with JetBrains Mono for license plates and currency.

Header & Navigation:
- Top bar with logo "GestAuto", studio name "Studio ArtDetail", live time badge, quick search bar (Search client or plate), and studio profile avatar.
- Prominent CTA button: "+ Novo Check-in / Entrada" with glowing amber button.

Top Metrics Row (KPI Summary):
- 4 sleek cards:
  1. "Faturado Hoje": "R$ 1.450,00" (subtle green trend badge)
  2. "A Receber Pendente": "R$ 350,00" (warning slate badge)
  3. "Carros no Pátio": "5 veículos ativos" (garage icon)
  4. "Pós-Venda do Dia": "3 recalls pendentes" (pulsing notification dot)

Main Content Area (Split View):
- Column 1 (Left / 40% width): "Agendamentos de Hoje". Shows cars expected to arrive today with their scheduled times (e.g. 09:00 - Audi RS6, 11:30 - BMW M3). Each item has a 1-click button: "Confirmar Entrada".
- Column 2 (Right / 60% width): "Boxes em Atendimento (Pátio Ativo)". Card grid of vehicles currently inside:
  - Box 1: "Porsche 911 GT3" (Plate: BRA2E19), Status badge: "EM EXECUÇÃO" (purple badge with live pulse), Services: "Polimento Técnico + Vitrificação", Time remaining: "45 min".
  - Box 2: "Toyota Hilux GR" (Plate: RIO9A21), Status badge: "PRONTO P/ RETIRADA" (emerald badge), Actions: green "Notificar Carro Pronto WhatsApp" button and "Registrar Entrega".
  - Box 3: "Civic Type-R" (Plate: EXP4H88), Status badge: "AGUARDANDO INÍCIO" (amber badge), Action: "Iniciar Serviço".

Design Vibe: Clean, spacious, highly responsive for both iPad touchscreens and desktop screens.
```

---

### 📅 Prompt 2: Agenda Futura (Dedicated Scheduling Screen)

```text
A modern calendar and timeline view for future bookings in a high-end auto detailing shop named "GestAuto".

Theme & Styling:
- Dark luxury theme (#0B0E14 background, #121722 cards, #263047 borders).
- Amber (#F59E0B) and sky blue (#38BDF8) accents.

Header:
- Title: "Agendamentos Futuros".
- Date range selector (This Week, Next Week, Next 30 Days, Custom range) and a button "+ Novo Agendamento".
- Quick filter tabs: "Todos os Dias", "Amanhã", "Esta Semana", "Próximo Mês".

Content:
- Chronological timeline layout grouped by date (e.g., "Amanhã - 23 de Setembro", "Quinta-feira - 24 de Setembro").
- Each appointment card shows:
  - Time slot (e.g., "09:00 - 12:00")
  - Customer name with quick contact link (WhatsApp icon)
  - Vehicle details: "Mercedes-AMG A45" with stylized Mercosul plate badge "ABC1D23"
  - Scheduled services: "Lavagem Detalhada + Higienização Interna"
  - Estimated total value: "R$ 480,00"
  - Action buttons: "Editar", "Cancelar", and green button "Confirmar via WhatsApp" (sends automated confirmation link).
- Empty state alert if no bookings for a selected day with a button to "Adicionar Agendamento".
```

---

### 💬 Prompt 3: Central de Pós-Venda & Retenção de Clientes (Post-Sales Hub)

```text
A customer retention and post-sales recall management screen for an automotive detailing studio named "GestAuto".

Theme & Styling:
- Dark slate aesthetic (#0B0E14 canvas, #121722 card surfaces).
- Emerald WhatsApp green (#25D366) as the highlight hero color for contact triggers.
- Amber gold (#F59E0B) for revenue recovery badges.

Top Summary Bar:
- 3 cards showing retention metrics:
  1. "Clientes para Contato Hoje": "6 clientes"
  2. "Taxa de Retorno do Mês": "42% reagendados"
  3. "Receita Estimada de Retorno": "R$ 3.200,00"

Main Table / Card Feed:
- Title: "Clientes Prontos para Retorno e Manutenção".
- Filter toggles: "Pendentes Hoje (6)", "Já Contatados (18)", "Reagendados (12)".
- Cards list of customers due for maintenance:
  - Card 1:
    - Customer: "Dr. Ricardo Mendes" (WhatsApp: (11) 98765-4321)
    - Vehicle: "BMW X5 M" (Plate: RIK5M00)
    - Original Service Done: "Vitrificação Cerâmica 9H (Realizada há 60 dias)"
    - Recommended Recall: "Lavagem de Manutenção da Vitrificação"
    - Status Badge: "PENDENTE" (amber)
    - Prominent Call to Action: Large green button with WhatsApp icon: "Chamar no WhatsApp (Mensagem Pronta)". Hovering previews the generated text with customer name and car model.
    - Quick status dropdown: [Marcar como Contatado | Reagendado | Ignorado].
- Side drawer or preview modal showing the pre-configured WhatsApp message that opens in wa.me.
```

---

### 🚗 Prompt 4: Modal de Check-in Rápido / Entrada de Veículo (Quick Check-in Modal)

```text
A streamlined, ultra-fast 3-step vehicle check-in modal dialog for a garage management software named "GestAuto".

Modal Properties:
- Centered dark modal dialog with dark backdrop blur (backdrop-blur-md, background #121722, border 1px solid #263047, rounded-2xl).
- Max width 650px.
- Clean progress steps indicator at the top: "1. Veículo & Cliente" -> "2. Serviços" -> "3. Confirmação".

Form Fields:
1. Quick Plate Lookup:
   - High-contrast input field with Mercosul plate mask format (e.g., "ABC-1D23").
   - Auto-complete badge: if existing car found, shows "Cliente já cadastrado: Carlos Drummond (11 99999-8888)". If new, expands inline input for "Nome do Cliente", "WhatsApp", "Marca/Modelo", "Cor".
2. Service Selection:
   - Interactive checkbox cards for popular services:
     - [x] "Polimento Comercial" — R$ 450,00 (180 min)
     - [ ] "Higienização Interna Completa" — R$ 350,00 (120 min)
     - [x] "Lavagem Técnica Detalhada" — R$ 90,00 (60 min)
3. Delivery Forecast & Payment notes:
   - Estimated delivery time picker (Defaults to "Hoje, 17:30").
   - Total calculated in real-time at the bottom right: "Total: R$ 540,00" in bold amber typography.

Modal Footer:
- Left: "Cancelar" button (ghost outline).
- Right: "Concluir Entrada no Pátio" (large amber button #F59E0B with car icon).
```

---

### ⚙️ Prompt 5: Configurações de Templates de WhatsApp & Catálogo de Serviços

```text
A clean settings management screen for customizing automated WhatsApp messages and service pricing for an automotive studio in "GestAuto".

Theme & Styling:
- Consistent dark theme (#0B0E14 background, #121722 card containers).

Tabbed Interface:
- Tab 1 (Active): "Templates de Mensagens WhatsApp"
- Tab 2: "Catálogo de Serviços & Preços"

Tab 1 Content (WhatsApp Templates Editor):
- Explanation banner: "Configure as mensagens automáticas enviadas aos clientes. Utilize as tags dinâmicas como {cliente}, {carro}, {placa}, {oficina}, {valor}."
- 3 interactive editor cards:
  1. "Confirmação de Agendamento": Textarea with syntax highlighting for tags, character counter, and real-time WhatsApp bubble preview on the right.
  2. "Carro Pronto para Retirada": Textarea with quick tag insert pills: [+ Nome do Carro] [+ Chave Pix] [+ Valor Total]. Live mobile bubble preview showing realistic WhatsApp chat bubble with checkmarks.
  3. "Recall de Pós-Venda": Textarea configured for retention messages.
- Action: "Salvar Alterações" button with green feedback indicator.

Design: Professional, clear labels, tags rendered as clickable chips.
```

---

## 6. Próximos Passos Sugeridos

1. **Submeter os Prompts ao Stitch IA:**
   * Utilizar os prompts da **Seção 5** para gerar os protótipos de tela.
   * Analisar os resultados visuais gerados (disposição dos boxes, contraste das placas e fluidez do dashboard).
2. **Ajustes de Preferência Visual:**
   * O usuário pode indicar ajustes pontuais de cores, layout ou densidade de informações com base nas telas geradas.
3. **Passagem para o Código (Fase 6):**
   * Assim que aprovadas as ideias no Stitch, montaremos os componentes equivalentes no Next.js com Tailwind CSS e shadcn/ui.
