# Word Flight

Aplicacao web para pesquisar voos pelo numero, mostrar os detalhes do voo e animar a rota em um mapa interativo.

O projeto roda com dados mock por padrao, entao da para desenvolver sem configurar chave externa. Tambem existe suporte ao provider real da AeroDataBox via RapidAPI.

## Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- MapLibre GL
- Turf.js
- AeroDataBox via RapidAPI
- Bun

## Funcionalidades

- Busca de voo por codigo, como `DL47` ou `AA100`
- Mapa com origem, destino e rota curva
- Aviao animado acompanhando a rota
- Painel lateral com dados do voo
- Provider mock para desenvolvimento local
- Provider AeroDataBox para dados reais

## Como rodar

Instale as dependencias:

```bash
bun install
```

Crie o arquivo `.env.local` a partir do exemplo:

```bash
cp .env.example .env.local
```

Para rodar com dados mock, mantenha:

```env
FLIGHT_DATA_PROVIDER=mock
RAPIDAPI_KEY=
RAPIDAPI_HOST=aerodatabox.p.rapidapi.com
```

Inicie o servidor de desenvolvimento:

```bash
bun run dev
```

Acesse:

```text
http://localhost:3000
```

## Usando a API real

Para usar a AeroDataBox, configure o `.env.local` assim:

```env
FLIGHT_DATA_PROVIDER=aerodatabox
RAPIDAPI_KEY=sua_chave_rapidapi
RAPIDAPI_HOST=aerodatabox.p.rapidapi.com
```

Depois reinicie o servidor.

## Scripts

```bash
bun run dev
bun run lint
bun run typecheck
bun run build
```
