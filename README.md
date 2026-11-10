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
- Agendamento e detalhamento de partidas (horários, locais, confirmações).
- Controle financeiro de mensalidades e penalidades (cartões, atrasos).
- Gestão de convidados e controle de presença.
- Compartilhamento de documentos e regulamentos do grupo.
- Autenticação e perfil do atleta.

---

## 🛠️ Log e Mapeamento das Tecnologias Usadas

Esta seção documenta **todas as tecnologias do projeto**, suas versões exatas e **como estão sendo aplicadas no código-fonte**. Este registro deve ser mantido atualizado a cada nova funcionalidade implementada.

### Matriz de Tecnologias

| Tecnologia | Versão | Categoria | Finalidade no Projeto | Onde e Como é Usada |
| :--- | :--- | :--- | :--- | :--- |
| **React** | `19.2.3` | Biblioteca Base | Criação de interfaces reativas e componentização declarativa | Base de todos os componentes (`useState`, `useEffect`, `useCallback`, `useMemo`) em telas e componentes compartilhados. |
| **React Native** | `0.86.3` | Framework Mobile | Fornece componentes primitivos nativos para Android e iOS | Utilizado em todo o app via `View`, `Text`, `TextInput`, `TouchableOpacity`, `ScrollView`, `FlatList`, `Modal`, `StyleSheet` e `Platform`. |
| **TypeScript** | `~6.0.3` | Linguagem / Tipagem | Tipagem estática, prevenção de erros em tempo de compilação e autocompletion | Interfaces e tipos de dados em rotas tipadas, contratos de props em componentes e tipagem de dados (jogadores, partidas, financeiro). |
| **Expo SDK** | `~57.0.26` | Plataforma / Toolchain | Suporte ao ciclo de vida, build, empacotamento e execução multiplataforma | Gerencia o ambiente de execução (`npx expo start`), plugins de configuração nativa em `app.json` e suporte ao Expo Go. |
| **Expo Router** | `~57.0.24` | Navegação | Sistema de roteamento moderno baseado no sistema de arquivos | Estrutura de pastas em `src/app/` com rotas estáticas (`/login`, `/dashboard`, `/documents`), rotas dinâmicas (`/games/[id]`), layouts aninhados (`_layout.tsx`) e abas (`Tabs`). |
| **React Native Safe Area Context** | `~5.7.0` | UI / Layout | Ajuste automático para entalhes (notches), barras de status e áreas seguras | `SafeAreaView` e hook `useSafeAreaInsets` para evitar sobreposição em telas com cantos arredondados ou ilhas dinâmicas. |
| **React Native Screens** | `~4.26.0` | Performance / Navegação | Gerenciamento de memória nativa para telas de navegação | Otimiza transições de pilha e tabs, reduzindo consumo de memória RAM ao desmontar telas inativas nativamente. |
| **React Native Gesture Handler** | `~2.32.0` | Interatividade / Toques | Detecção de gestos complexos e toques fluidos com resposta nativa | Manipulação de toques nativos nos componentes interativos e base para suporte a arrastar/deslizar. |
| **React Native Reanimated** | `4.5.1` | Animações | Animações fluidas de alto desempenho executadas na thread de UI | Animações de transição de elementos e ícones animados (`src/components/animated-icon.tsx`). |
| **React Native Worklets** | `0.10.1` | Execução Nativa | Execução de funções JavaScript na thread de UI (worklets) | Motor auxiliar do Reanimated para cálculos de animação a 60/120 fps sem travar a thread JS. |
| **Expo Vector Icons** | `^15.0.2` | Design / Ícones | Pacote abrangente de ícones vetoriais multiplataforma | Ícones de navegação nas abas, botões de ação, cards de status e listas (MaterialIcons, Ionicons, FontAwesome). |
| **Expo Symbols** | `~57.0.3` | Design / Ícones | Renderização de SF Symbols com fallback nativo | Ícones refinados para iOS e representação padronizada no visual de abas. |
| **Expo Image** | `~57.0.5` | Mídia / Imagens | Carregamento otimizado de imagens com cache e transição suave | Exibição de escudos, avatares de jogadores e ilustrações com alta performance e sem engasgos de memória. |
| **Expo Splash Screen** | `~57.0.9` | Inicialização | Controle programático da tela de Splash nativa | Mantém a tela inicial congelada enquanto fontes, temas e estados de sessão são validados. |
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
  - As telas existentes em `meu-app/src/app/` foram preservadas intactas para integração gradual pela equipe.
- **Saneamento e Compatibilização de Dependências (Expo SDK 57)**:
  - Reversão do conflito de dependências gerado por `npm audit fix --force`.
  - Alinhamento de todos os pacotes nativos para as versões oficiais do Expo SDK 57 via `npx expo install --fix`.
  - Adição de tipagens ambientais para módulos CSS (`src/types/declarations.d.ts`), garantindo compilação TypeScript com 0 erros (`tsc --noEmit`).
  - Validação de integridade do ambiente com `expo-doctor` (21/21 verificações aprovadas).

---

## 📋 Checklist dos Requisitos Acadêmicos

Acompanhamento do atendimento aos requisitos definidos na proposta do trabalho:

- [x] **Identidade Visual**: Nome e conceito definidos ("Gestão Bola").
- [x] **Navegação Multitelas**: Expo Router com abas e rotas dinâmicas (`/login`, `/dashboard`, `/games`, `/games/[id]`, `/documents`, `/profile`, `/more`, `/guests`).
- [ ] **Entrada de Dados Funcional**: Formulários com campos de texto, seletores e checkboxes.
- [ ] **Interatividade Real**: Botões executando ações efetivas com feedback visual.
- [ ] **Processamento e Cálculos**: Lógica de negócios ativa (somas financeiras, filtros de partidas, ordenação e status dinâmico).
- [ ] **Validação com Mensagens**: Checagem de obrigatoriedade de campos e alertas ao usuário.
- [ ] **Armazenamento / Persistência**: Gestão de dados em memória e/ou persistência local/remota.
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
│   │   │   ├── _layout.tsx    # Layout raiz e definição de abas/pilhas
│   │   │   ├── login.tsx      # Tela de autenticação
│   │   │   ├── dashboard.tsx  # Visão geral (próxima pelada, resumo)
│   │   │   ├── games.tsx      # Listagem de partidas
│   │   │   ├── games/[id].tsx # Detalhes da partida selecionada
│   │   │   ├── documents.tsx  # Documentos e regulamentos
│   │   │   ├── profile.tsx    # Perfil e histórico do atleta
│   │   │   ├── more.tsx       # Menu adicional
│   │   │   └── guests/        # Gestão de convidados
│   │   ├── components/        # Componentes visuais reutilizáveis
│   │   ├── constants/         # Cores, temas e dados estáticos
│   │   ├── hooks/             # Custom Hooks (tema, esquema de cores)
│   │   ├── types/             # Contratos e interfaces TypeScript (ball-management.ts)
│   │   └── utils/             # Regras de negócio, cálculos (R5) e validações (R6)
│   ├── app.json               # Configurações do Expo
│   ├── package.json           # Dependências e scripts
│   └── tsconfig.json          # Configuração TypeScript
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
