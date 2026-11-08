# Mayara Strobel Make Up

Protótipo responsivo e instalável para cursos de maquiagem, turmas presenciais, serviços para eventos, portfólio, blog, comunidade e painel de equipe. Os perfis e as transações são demonstrativos; não há cobrança, envio externo de formulários ou autenticação real.

## Requisitos

- Node.js 20.9 ou superior.
- npm.

## Instalação e execução

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). A aplicação usa Next.js com App Router, TypeScript e Tailwind CSS.

## Rotas demonstrativas

| Rota | Experiência |
|---|---|
| `/` | Portal, portfólio, cursos, agenda, blog e atalhos para a comunidade. |
| `/app` | Área da aluna: cursos, aulas, progresso, agenda e instalação do PWA. |
| `/forum` | Tópicos de exemplo, respostas demonstrativas e denúncias. |
| `/admin` | Painel da equipe: inscrições, turmas, pedidos, publicações e moderação. |
| `/sobre`, `/cursos`, `/turmas`, `/eventos`, `/portfolio`, `/blog` | Atalhos para a respectiva seção do portal. |

O nome “Aluna Mayara” é um perfil fictício para percorrer a demonstração. Os formulários avisam que os dados ficam apenas neste navegador.

## Persistência e limitações

As alterações usam `localStorage` versionado (`mayara-strobel-demo-v1`) e ficam visíveis entre as áreas da mesma origem e do mesmo navegador. O botão **Reiniciar demonstração** restaura os dados de exemplo. Os dados não são compartilhados entre dispositivos nem enviados a um servidor e podem ser apagados pelo navegador. Pagamentos, notificações, autenticação, integração Supabase e publicação em lojas não fazem parte do protótipo.

## Mídia

- Logo oficial: `public/brand/logo-oficial.png`.
- Hero responsivo: `public/media/hero/mayara-hero-desktop.png` (desktop) e `public/media/hero/mayara-hero-mobile.png` (mobile). A imagem de parallax fica em `public/media/parallax`.
- Retrato editorial: `public/media/editorial`.
- Fotos autorizadas de portfólio: `public/media/portfolio`.
- Fotos e vídeos originais permanecem preservados na pasta externa `imagens/`.
- Os sete arquivos `.mp4` não foram copiados para o Git. Se vídeos forem habilitados em uma próxima etapa, adicionar apenas capas e URLs de mídia autorizadas, sem incorporar caminhos absolutos do OneDrive.

As fotos disponíveis são arquivos de trabalhos fornecidos, mas não incluem metadados para identificar categorias específicas; a galeria usa rótulos demonstrativos neutros para revisão. A reprodução de vídeo de trabalhos não está habilitada nesta fase.

## PWA e conectividade

O app inclui manifesto, instalação suportada pelo navegador, ícone vetorial e service worker. Ao perder conexão durante a navegação, o app apresenta uma tela que explica a indisponibilidade; aulas em vídeo e novos conteúdos requerem internet. O conteúdo é armazenado apenas durante o uso normal do navegador.

## Verificação e publicação

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Para publicar na Vercel, importe o repositório e use a raiz `.`; o framework é detectado como Next.js e o comando de build padrão é `npm run build`. Nenhuma variável de ambiente é necessária para a demonstração.

## Roteiro de apresentação

1. Abra um trabalho no portfólio e solicite um orçamento fictício.
2. Entre em `/app`, inscreva-se em um curso pelo portal e marque uma aula como concluída.
3. Faça a inscrição numa turma com vaga e entre na lista de espera para a turma lotada.
4. Abra `/admin` para acompanhar os pedidos e a agenda; publique um artigo de demonstração e confira a fila de moderação.
5. Use **Reiniciar demonstração** para limpar os dados locais.
