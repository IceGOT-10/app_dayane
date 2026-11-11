# Gestão Bola ⚽

> **Trabalho Prático: Desenvolvimento de um Aplicativo Móvel**  
> **Curso:** Engenharia da Computação  
> **Disciplina:** Programação para Dispositivos Móveis  
> **Docente:** Profª Dayane  
> **Equipe:** 5 integrantes  
> **Repositório:** [https://github.com/IceGOT-10/app_dayane](https://github.com/IceGOT-10/app_dayane)

---

## 📌 Visão Geral do Projeto

O **Gestão Bola** é um aplicativo móvel desenvolvido em **React Native**, **TypeScript** e **Expo**, projetado para solucionar problemas comuns na organização de grupos esportivos amadores (futebol/peladas).

O aplicativo centraliza:
- Agendamento, cadastro, edição e detalhamento de partidas (horários, locais, confirmações, justificativa de ausência, placares e artilharia).
- Controle financeiro de mensalidades, pagamentos (PIX, Dinheiro, Transferência), penalidades (cartões, atrasos) e extrato cronológico completo.
- Gestão completa de convidados (aprovação, reprovação, edição, exclusão, regra de 1 convidado/mês por sócio e máx. 2 aprovados/jogo).
- Leitura integral e geração/compartilhamento real de documentos e regulamentos em PDF.
- Autenticação real validada no banco de dados local, recuperação de senha, cadastro de novos atletas e edição de perfil.

---

## 🛠️ Log e Mapeamento das Tecnologias Usadas

Esta seção documenta **todas as tecnologias do projeto**, suas versões exatas e **como estão sendo aplicadas no código-fonte**. Este registro deve ser mantido atualizado a cada nova funcionalidade implementada.

### Matriz de Tecnologias

| Tecnologia | Versão | Categoria | Finalidade no Projeto | Onde e Como é Usada |
| :--- | :--- | :--- | :--- | :--- |
| **React** | `19.2.3` | Biblioteca Base | Criação de interfaces reativas e componentização declarativa | Base de todos os componentes (`useState`, `useEffect`, `useCallback`, `useMemo`) em telas e componentes compartilhados. |
| **React Native** | `0.86.3` | Framework Mobile | Fornece componentes primitivos nativos para Android e iOS | Utilizado em todo o app via `View`, `Text`, `TextInput`, `TouchableOpacity`, `ScrollView`, `FlatList`, `Modal`, `StyleSheet` e `Platform`. |
| **TypeScript** | `~6.0.3` | Linguagem / Tipagem | Tipagem estática estrita (`strict: true`), prevenção de erros e contratos de domínio | Interfaces estritas sem `any` em `src/types/ball-management.ts` (`Player`, `Game`, `Guest`, `FinancialMetric`, `FinancialTransaction`, `ClubDocument`). |
| **Expo SDK** | `~57.0.32` | Plataforma / Toolchain | Suporte ao ciclo de vida, build, empacotamento e execução multiplataforma | Gerencia o ambiente de execução (`npx expo start`), plugins de configuração nativa em `app.json` e suporte ao Expo Go. |
| **Expo Router** | `~57.0.30` | Navegação | Sistema de roteamento moderno baseado no sistema de arquivos | Estrutura de pastas em `src/app/` com rotas estáticas (`/login`, `/dashboard`, `/documents`, `/profile`, `/more`), rotas dinâmicas (`/games/[id]`) e abas (`Tabs`). |
| **Expo SQLite** | `~57.0.4` | Banco de Dados Local | Persistência relacional local SQL embarcada no dispositivo móvel | Criação e sincronização automática das tabelas `players`, `games`, `guests`, `financial_metrics`, `transactions` e `documents` em `src/database/db.ts`. |
| **AsyncStorage** | `2.2.0` | Persistência Assíncrona | Persistência chave-valor para sessão do atleta e fallback seguro na Web | Armazena a sessão ativa do atleta e garante persistência multiplataforma em navegadores Web em `src/database/db.ts`. |
| **Expo Print** | `~57.0.2` | Geração de PDF | Renderização de documentos HTML estilizados em arquivos PDF nativos ou impressão Web | Gera os PDFs oficiais do Estatuto Social, Regimento Interno, Ficha de Associação e Política de Privacidade em `src/app/documents.tsx`. |
| **Expo Sharing** | `~57.0.25` | Compartilhamento Nativo | Aciona a folha de compartilhamento do Android/iOS para envio de arquivos gerados | Compartilha os arquivos PDF gerados pelo `expo-print` via WhatsApp, e-mail ou armazenamento local em `src/app/documents.tsx`. |
| **NativeWind** | `^4.2.7` | UI / Estilização | Aplicação de classes utilitárias do Tailwind CSS nativamente nos componentes React Native | Configurado via `babel.config.js`, `metro.config.js`, `tailwind.config.js`, `global.css` e aplicado em `buttons.tsx`, `login.tsx`, `dashboard.tsx`, `games.tsx`, `games/[id].tsx`, `guests/index.tsx`, `documents.tsx` e `profile.tsx`. |
| **Tailwind CSS** | `^3.4.17` | UI / CSS Utility | Motor de estilização utilitária usado pelo NativeWind v4 | Define o sistema de classes utilitárias compiladas pelo plugin `nativewind/preset` em `tailwind.config.js`. |
| **Zustand** | `^5.1.0` | Gerenciamento de Estado | Estado global reativo sincronizado com o banco de dados local | Implementado em `src/store/useAppStore.ts` integrado a `db.ts`, `calculations.ts` e `validations.ts`. |
| **React Hook Form** | `^7.91.0` | Formulários | Controle performático de formulários e estado de inputs | Aplicado com `useForm` e `Controller` em `login.tsx` (login, recuperação de senha e cadastro), `games.tsx`, `games/[id].tsx`, `guests/index.tsx` e `profile.tsx`. |
| **Zod** | `^4.6.7` | Validação de Esquemas | Validação tipada e declarativa de regras de negócio | 9 esquemas declarados em `src/schemas/forms.schema.ts` com inferência estrita `z.infer`. |
| **@hookform/resolvers** | `^7.0.5` | Integração / Validação | Adaptador oficial que conecta esquemas do Zod ao React Hook Form | Ponte tipada (`zodResolver`) ativa em todos os formulários do aplicativo. |
| **ESLint (`eslint-config-expo`)** | `^9.0.0` / `~57.0.2` | Qualidade / Lint | Análise estática de código e padrões React Native/Expo | Configurado em `eslint.config.js` e executado via `npx expo lint`. |
| **React Native Safe Area Context** | `~5.7.0` | UI / Layout | Ajuste automático para entalhes (notches), barras de status e áreas seguras | `SafeAreaView` e hook `useSafeAreaInsets` para evitar sobreposição em telas com cantos arredondados ou ilhas dinâmicas. |
| **React Native Screens** | `~4.26.0` | Performance / Navegação | Gerenciamento de memória nativa para telas de navegação | Otimiza transições de pilha e tabs, reduzindo consumo de memória RAM ao desmontar telas inativas nativamente. |
| **React Native Gesture Handler** | `~2.32.0` | Interatividade / Toques | Detecção de gestos complexos e toques fluidos com resposta nativa | Manipulação de toques nativos nos componentes interativos e base para suporte a arrastar/deslizar. |
| **React Native Reanimated** | `4.5.1` | Animações | Animações fluidas de alto desempenho executadas na thread de UI | Animações de transição de elementos e ícones animados (`src/components/animated-icon.tsx`). |
| **React Native Worklets** | `0.10.1` | Execução Nativa | Execução de funções JavaScript na thread de UI (worklets) | Motor auxiliar do Reanimated para cálculos de animação a 60/120 fps sem travar a thread JS. |
| **Expo Vector Icons** | `^15.0.2` | Design / Ícones | Pacote abrangente de ícones vetoriais multiplataforma | Ícones de navegação nas abas, botões de ação, cards de status e listas (MaterialIcons, Ionicons, FontAwesome). |
| **Expo Symbols** | `~57.0.3` | Design / Ícones | Renderização de SF Symbols com fallback nativo | Ícones refinados para iOS e representação padronizada no visual de abas. |
| **Expo Image** | `~57.0.5` | Mídia / Imagens | Carregamento otimizado de imagens com cache e transição suave | Exibição de escudos, avatares de jogadores e ilustrações com alta performance e sem engasgos de memória. |
| **Expo Splash Screen** | `~57.0.11` | Inicialização | Controle programático da tela de Splash nativa | Mantém a tela inicial congelada enquanto fontes, temas e estados de sessão são validados. |
| **Expo Status Bar** | `~57.0.1` | UI / Sistema | Controle de estilo e contraste da barra de status | Ajuste dinâmico entre estilos claro e escuro conforme o tema ativo no app (`light` / `dark`). |
| **React Native Web** | `~0.21.0` | Multiplataforma | Conversão dos componentes React Native para elementos do DOM HTML | Permite executar e testar a aplicação diretamente no navegador (`npm run web`). |

---

## 📈 Histórico de Atualizações e Mudanças (Changelog)

Este diário registra as mudanças realizadas no projeto para facilitar a elaboração do **Relatório Técnico** e a preparação para a **Apresentação**:

### [Não versionado / Atual] - 10/11/2026
- **Configuração do Repositório Git**: Vinculação e sincronização com o repositório remoto GitHub (`https://github.com/IceGOT-10/app_dayane.git`).
- **Organização de Pastas**: Desaninhamento dos arquivos da raiz após extração de arquivo zip.
- **Documentação de Governança e IA**:
  - Criação do guia contínuo de instruções da IA (`GEMINI.md`) baseado nos requisitos da disciplina da Profª Dayane.
  - Atualização deste `README.md` com mapeamento tecnológico completo e diário de bordo.
- **Implementação Fundacional (Etapas 1, 2 e 3)**:
  - Criação de contratos TypeScript estritos em `meu-app/src/types/ball-management.ts` (`Player`, `Game`, `Guest`, `FinancialMetric`, `AttendanceRecord`).
  - Implementação do motor de cálculos matemáticos puros (Requisito R5) em `meu-app/src/utils/calculations.ts` (`calculateFinancialSummary`, `calculateGameAttendance`, `calculateCostSharing`, `formatCurrencyBRL`).
  - Implementação do módulo de validação defensiva e sanitização (Requisito R6) em `meu-app/src/utils/validations.ts` (`validateGuestName`, `validateMonetaryInput`, `validateLoginCredentials`, `validateGuestQuota`).
- **Saneamento e Compatibilização de Dependências (Expo SDK 57)**:
  - Alinhamento de todos os pacotes nativos para as versões oficiais do Expo SDK 57 via `npx expo install --fix`.
  - Validação de integridade do ambiente com `expo-doctor` (21/21 verificações aprovadas).
- **Configuração da Stack (`stack-tacnologica.md`)**:
  - Instalação e configuração do **NativeWind v4 (`^4.2.7`)** e **Tailwind CSS (`^3.4.17`)** com `global.css`, `tailwind.config.js`, `babel.config.js`, `metro.config.js` e `nativewind-env.d.ts`.
  - Instalação sequencial de **Zustand (`^5.1.0`)**, **React Hook Form (`^7.91.0`)**, **Zod (`^4.6.7`)** e **`@hookform/resolvers` (`^7.0.5`)**.
  - Configuração de ESLint (`eslint` + `eslint-config-expo`) via `eslint.config.js`.
- **Reconstrução Integrada das Etapas 1, 2 e 3 (Stack Moderna)**:
  - Criação de `meu-app/src/schemas/forms.schema.ts` com esquemas Zod + `z.infer`.
  - Migração das telas `login.tsx`, `dashboard.tsx`, `games.tsx`, `games/[id].tsx`, `guests/index.tsx` e `profile.tsx` para Zustand + React Hook Form + NativeWind.
- **Banco de Dados Local, Dados Fictícios (Seed) e Implementação dos 6 Pontos Pendentes**:
  - Instalação de `expo-sqlite`, `@react-native-async-storage/async-storage`, `expo-print` e `expo-sharing` via `npx expo install`.
  - Criação da camada de persistência relacional híbrida em `meu-app/src/database/db.ts` (tabelas SQLite `players`, `games`, `guests`, `financial_metrics`, `transactions`, `documents` + fallback automático `AsyncStorage` para Web) e `meu-app/src/database/seed.ts`.
  - **Ponto 1 (Convidados)**: Filtros completos (`Todos`, `Aprovado`, `Pendente`, `Reprovado`), badges tricolores, modal de edição/aprovação/reprovação/exclusão e validação da cota mensal (`validateMonthlyGuestQuota`: máx. 1 convidado/mês por sócio) e por jogo (`validateGuestQuota`: máx. 2 aprovados/jogo).
  - **Ponto 2 (Autenticação Real)**: Validação de credenciais contra o banco local em `login.tsx`, troca de contas entre os 5 atletas fictícios, modal de redefinição de senha (`forgotPasswordSchema`) e modal de cadastro de novo atleta (`registerPlayerSchema`).
  - **Ponto 3 (Jogos, Ausência, Placares e CRUD)**: Botão `"Não irei"` (`declineGameParticipation`) na aba Presença, placar numérico e artilharia com modal de edição (`gameScoreSchema`) na aba Resultado, e modais de criação e edição de partidas (`gameFormSchema`) em `games.tsx` e `games/[id].tsx`.
  - **Ponto 4 (Documentos e PDF)**: Modal de leitura integral dos 4 documentos oficiais e exportação/compartilhamento real em PDF via `expo-print` e `expo-sharing` em `documents.tsx`.
  - **Ponto 5 (Perfil, Penalidades e Extrato)**: Modal de edição de perfil (`profileEditSchema`), lançamento de multas/cartões (`penaltySchema`) e histórico cronológico detalhado de transações (`transactions`) na aba Financeiro de `profile.tsx`.
  - **Ponto 6 (Componentização e Limpeza)**: Criação de `PrimaryButton`, `SecondaryButton` e `DangerButton` em `src/components/buttons.tsx` e remoção dos arquivos residuais `src/app/explore.tsx` e `src/app/App.tsx`.
- **Resolução do Build Web no Metro (`Worker chunk not found`)**:
  - Criação de `meu-app/src/database/db.web.ts` utilizando a convenção oficial do Expo/React Native de arquivos com sufixo de plataforma (`.web.ts`).
  - O arquivo Web roda puramente com `@react-native-async-storage/async-storage`, eliminando o carregamento dos Web Workers nativos do `expo-sqlite` no navegador e assegurando execução sem erros tanto no Expo Go móvel quanto na Web.

---

## 📋 Checklist dos Requisitos Acadêmicos

Acompanhamento do atendimento aos requisitos definidos na proposta do trabalho:

- [x] **Identidade Visual**: Nome e conceito definidos ("Gestão Bola").
- [x] **Navegação Multitelas**: Expo Router com abas e rotas dinâmicas (`/login`, `/dashboard`, `/games`, `/games/[id]`, `/documents`, `/profile`, `/more`, `/guests`).
- [x] **Entrada de Dados Funcional**: Formulários tipados com `useForm` + `Controller` + `zodResolver` em todas as telas interativas.
- [x] **Interatividade Real**: Botões executando ações efetivas no Zustand e persistindo em SQLite/AsyncStorage (confirmar presença, justificar ausência, criar/editar partida, lançar placar, gerir convidados, amortizar saldo, aplicar multa, exportar PDF).
- [x] **Processamento e Cálculos**: Lógica matemática ativa (`calculateFinancialSummary`, `calculateGameAttendance`, `calculateCostSharing`) refletida em tempo real nas telas.
- [x] **Validação com Mensagens**: 9 esquemas Zod (`forms.schema.ts`) e validadores defensivos (`validations.ts`) com mensagens em Português inline e via `Alert`.
- [x] **Armazenamento / Persistência**: Persistência relacional local com `expo-sqlite` + fallback `AsyncStorage` (`src/database/db.ts` e `src/database/seed.ts`) integrada ao Zustand (`hydrateStore`).
- [ ] **Testes no Expo Go**: Validação em dispositivo físico/emulador.
- [ ] **Relatório Técnico em PDF**: Elaboração conforme itens 1 a 9 do edital.
- [ ] **Apresentação e Domínio do Código**: Estudo dos componentes e funções por todos os 5 integrantes.

---

## 📂 Estrutura de Arquivos

```text
app_dayane/
├── meu-app/
│   ├── assets/                # Imagens, ícones do app e splash
│   ├── src/
│   │   ├── app/               # Rotas e telas (Expo Router)
│   │   │   ├── _layout.tsx    # Layout raiz, hidratação do banco e abas
│   │   │   ├── index.tsx      # Redirecionamento inicial para /login
│   │   │   ├── login.tsx      # Autenticação real, redefinição de senha e cadastro
│   │   │   ├── dashboard.tsx  # Visão geral reativa (Zustand + Cálculos + NativeWind)
│   │   │   ├── games.tsx      # Listagem e cadastro de novas partidas
│   │   │   ├── games/[id].tsx # Detalhes, presença, ausência ("Não irei"), edição e placar
│   │   │   ├── documents.tsx  # Leitura integral e geração/compartilhamento de PDF
│   │   │   ├── profile.tsx    # Edição de perfil, pagamentos, multas e extrato
│   │   │   ├── more.tsx       # Menu adicional e encerramento de sessão
│   │   │   └── guests/        # Gestão completa de convidados (CRUD + cotas)
│   │   ├── components/        # Componentes visuais reutilizáveis (buttons.tsx, cabeçalhos)
│   │   ├── constants/         # Cores, temas e configurações visuais
│   │   ├── database/          # Persistência SQLite + AsyncStorage (db.ts) e dados iniciais (seed.ts)
│   │   ├── hooks/             # Custom Hooks (tema, esquema de cores)
│   │   ├── schemas/           # Esquemas de validação Zod (forms.schema.ts)
│   │   ├── store/             # Estado global com Zustand sincronizado ao banco (useAppStore.ts)
│   │   ├── types/             # Contratos e interfaces TypeScript (ball-management.ts)
│   │   └── utils/             # Regras de negócio, cálculos (R5) e validações (R6)
│   ├── app.json               # Configurações do Expo e plugins nativos
│   ├── babel.config.js        # Preset do Expo + NativeWind
│   ├── eslint.config.js       # Configuração ESLint do Expo
│   ├── global.css             # Diretivas base do Tailwind CSS
│   ├── metro.config.js        # Empacotador Metro integrado ao NativeWind e suporte WASM
│   ├── nativewind-env.d.ts    # Tipagem TypeScript da prop className
│   ├── package.json           # Dependências e scripts
│   ├── tailwind.config.js     # Configuração de conteúdo e preset NativeWind
│   └── tsconfig.json          # Configuração TypeScript estrita
├── GEMINI.md                  # Diretrizes pedagógicas e técnicas para a IA
└── README.md                  # Documentação central do projeto
```

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- **Node.js** (versão 20 ou superior)
- **npm** instalado
- Aplicativo **Expo Go** instalado no celular (Android ou iOS) ou emulador configurado.

### Passos:
1. Abra o terminal na pasta da aplicação:
   ```bash
   cd meu-app
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor do Expo:
   ```bash
   npx expo start
   ```
4. Escaneie o QR Code gerado pelo terminal no aplicativo **Expo Go** do seu celular, ou pressione `a` para emulador Android, `i` para simulador iOS ou `w` para rodar na Web.

---

## 👥 Instruções para os Integrantes da Equipe

- **Domínio do Código:** Todos os 5 integrantes devem entender cada componente, cada `useState` e cada função. A professora poderá pedir alterações ao vivo ou sortear quem explicará cada tela.
- **Uso da IA:** A cada nova tela ou lógica sugerida pelo Gemini, revise a explicação, teste a funcionalidade e registre no diário de bordo.
