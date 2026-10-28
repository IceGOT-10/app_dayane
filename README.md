# Gestao Bola

Aplicativo multiplataforma para gerenciamento de jogadores, partidas, documentos, convidados e informacoes financeiras de um grupo esportivo.

O projeto foi desenvolvido com Expo, React Native, Expo Router e TypeScript. Ele oferece uma interface responsiva para Android, iOS e navegador web.

## Visao geral

O **Gestao Bola** centraliza a experiencia do jogador em uma navegacao simples por abas. Na tela inicial, o usuario encontra a proxima pelada, a situacao de mensalidades, penalidades e convidados, além dos jogos em destaque.

Atualmente, os dados apresentados sao simulados diretamente no codigo. O projeto ainda não possui API, banco de dados ou autenticacao real.

## Funcionalidades

### Disponiveis

- Login com validacao dos campos e estado de carregamento.
- Painel com a proxima partida, local, horario e status.
- Resumo de mensalidade, penalidades e convidados.
- Lista de jogos disponiveis, em andamento e finalizados.
- Detalhe de jogos por rota dinamica.
- Perfil do jogador com informacoes pessoais, historico e financeiro.
- Tela de documentos oficiais.
- Area de convidados e menu de opcoes adicionais.
- Navegacao adaptada para Android, iOS e web.
- Tema claro ou escuro conforme a configuracao do sistema.
- Navegacao com Expo Router e rotas tipadas.

### Limitacoes atuais

- O login não realiza autenticacao contra um servidor.
- Jogadores, jogos, documentos e valores sao dados estáticos.
- Downloads, cadastro, recuperacao de senha e confirmação de presença são prototipos visuais.
- Não existe persistencia local ou remota de dados.

## Tecnologias

- Expo SDK 57
- React 19.2
- React Native 0.86
- Expo Router
- TypeScript 6
- React Native Safe Area Context
- React Native Gesture Handler
- React Native Reanimated
- React Native Worklets
- Expo Symbols
- Expo Image
- Expo Splash Screen
- Expo Vector Icons

## Requisitos

- Node.js 20 ou superior
- npm
- Android Studio para emulador Android, ou Expo Go
- Xcode para simulador iOS, ou Expo Go
- Navegador moderno para a versao web

Verifique o ambiente antes da instalacao:

```bash
node --version
npm --version
```

## Instalacao

Clone o repositorio e entre na pasta da aplicacao:

```bash
git clone https://github.com/IceGOT-10/app_dayane.git
cd app_dayane/meu-app
npm install
```

## Executando o projeto

Inicie o servidor Expo:

```bash
npm start
```

Execute diretamente em uma plataforma:

```bash
npm run android
npm run ios
npm run web
```

Modo geral do Expo:

```bash
npx expo start
```

No terminal, utilize o QR Code para abrir a aplicacao pelo Expo Go ou escolha a plataforma desejada. Modulos com codigo nativo podem exigir um development build.

## Rotas

| Rota | Descricao |
|---|---|
| `/login` | Tela de autenticacao simulada |
| `/dashboard` | Painel principal do jogador |
| `/games` | Lista filtravel de partidas |
| `/games/[id]` | Detalhes de uma partida |
| `/documents` | Documentos oficiais |
| `/profile` | Perfil, historico e dados financeiros |
| `/more` | Menu com opcoes adicionais |
| `/guests` | Gerenciamento de convidados |

## Estrutura

```text
meu-app/
├── assets/
│   ├── expo.icon/
│   └── images/
├── src/
│   ├── app/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── dashboard.tsx
│   │   ├── games.tsx
│   │   ├── games/[id].tsx
│   │   ├── documents.tsx
│   │   ├── profile.tsx
│   │   ├── more.tsx
│   │   └── guests/index.tsx
│   ├── components/
│   ├── constants/
│   └── hooks/
├── app.json
├── package.json
└── tsconfig.json
```

## Scripts

| Comando | Finalidade |
|---|---|
| `npm start` | Inicia o servidor Expo |
| `npm run android` | Executa em Android |
| `npm run ios` | Executa em iOS |
| `npm run web` | Executa no navegador |
| `npm run lint` | Executa o lint configurado pelo Expo |
| `npm run reset-project` | Executa o script de reinicializacao |

## Configuracao

A configuracao principal do Expo fica em `app.json`. Ali sao definidos nome, slug, versao, orientacao, esquema de URL, icones e plugins do projeto.

As rotas sao organizadas em `src/app`, conforme o Expo Router. Componentes, constantes e hooks reutilizaveis ficam fora da pasta de rotas.

## Qualidade

Execute a verificacao de tipos:

```bash
npx tsc --noEmit
```

Execute o lint, caso a configuracao ESLint esteja instalada:

```bash
npm run lint
```

Diagnostique incompatibilidades de dependencias:

```bash
npx expo-doctor
```

## Proximas etapas sugeridas

- Criar autenticação com API ou Firebase.
- Adicionar banco de dados para jogos, jogadores e documentos.
- Implementar confirmacao de presença.
- Disponibilizar cadastro e recuperacao de senha.
- Persistir mensalidades, penalidades e historico.
- Implementar download real dos documentos.
- Adicionar testes unitarios e de interface.
- Configurar builds de producao com EAS.

## Licenca

Consulte o arquivo `LICENSE` para os termos de licenciamento do projeto.

## Repositorio

<https://github.com/IceGOT-10/app_dayane>
