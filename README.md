# cht-shared

Pacote de código compartilhado entre frontend e backend.

## O que é

O `cht-shared` reúne contratos e utilitários reutilizáveis para manter consistência entre as aplicações.
É TypeScript puro, sem build próprio: quem consome importa os arquivos direto pelo alias `@shared/*`, que aponta para `cht-shared/src/*` (configurado no `cht-base` e no backend do cliente).

## O que faz

- Reúne validações e helpers comuns.
- Define contratos realmente compartilhados por múltiplos repositórios.
- Reduz divergência entre frontend e backend.

## Estrutura

Tudo fica em `src/`, organizado por assunto.

| Pasta | Conteúdo |
| --- | --- |
| `validators/` | Validadores de e-mail, telefone, senha, nome, CPF/CNPJ, login e usuário. `mecarvit.ts` valida os DTOs do domínio Mecarvit (cadastro, usuário, cargo, empresa, endereço, veículo, cliente, serviço, item, pagamento, ordem de serviço e registro de entrada/saída). |
| `format/` | Formatação de datas (`dateTime`), valores monetários (`moneyInput`) e máscaras de exibição de CPF, CNPJ, telefone e CEP (`displayMasks`). |
| `errors/` | `ApiError`: formato da resposta de erro da API, com mensagens por campo. É o mesmo formato que o formulário do front lê. |
| `cep/` | Consulta de endereço por CEP (`viaCep`): normaliza o CEP, monta a URL e interpreta a resposta. |
| `constants/` | Constantes de UI: variantes de botão, tipos de input e nomes de meses. |
| `interfaces/` | `FormField`: descrição de um campo de formulário. |
| `frontend/` | Utilitários de navegador: diretiva de tooltip, atalhos de teclado e camadas de modal, estado de modais na URL (`?modal=`), painéis flutuantes, z-index mais alto e montagem de query string. |
| `net/` | Descoberta da porta da API em loopback (`portScan`) e protocolo WebSocket (`wsProtocol`). |
| `terminal/` | `PrettyConsole`: saída colorida para scripts de terminal. |
| `mecarvit/` | Regras do domínio Mecarvit usadas pelo frontend e pelo backend do cliente: permissões e níveis de acesso, status e transições da ordem de serviço, situação de pagamento, tipos de veículo e payload de tempo real. |

## Contratos de domínio (Mecarvit)

- **Status da OS** (`mecarvit/osStatus`): `ABERTA`, `PENDENTE`, `EM_ANDAMENTO`, `CONCLUIDA`, `CANCELADA`, `ORCAMENTO` e `REABERTA`. As transições permitidas estão no próprio módulo; voltar para orçamento só é possível sem pagamentos lançados.
- **Permissões** (`mecarvit/access`): chaves nomeadas por área (`funcionarios`, `clientes`, `veiculos`, `os`, `financeiro`), como `clientes.ver` ou `os.pagamentos`. O `superadmin` passa por todas as verificações.
- **Pagamento** (`mecarvit/pagamentoSituacao`): calcula a situação de pagamento de um registro a partir do valor e do valor pago.

## Verificações

Alguns módulos têm um check executável ao lado do código (`*.check.js`):

```bash
node src/format/displayMasks.check.js
node src/frontend/keybinds.check.js
node src/mecarvit/osStatus.check.js
```

## Regras

- Só entra aqui o que for realmente usado por mais de um repositório.
- Sem UI de cliente e sem dependência dos clientes.
- Cada arquivo `.ts` começa com um JSDoc de módulo em inglês. Detalhes em [CONTRIBUTING.md](../CONTRIBUTING.md).
