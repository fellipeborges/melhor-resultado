# Melhor Resultado

Visualizador de resultados de corrida de rua. Lê páginas de [Apuração de Tempos](https://www.apuracaodetempos.com.br/) e exibe os dados de forma clara, com filtros e links compartilháveis.

## Como usar

1. Abra a aplicação no navegador.
2. Cole a URL da página de resultados (ex.: `https://www.apuracaodetempos.com.br/Resultados/runrumoaohexa/Resultados.html`).
3. Clique em **Processar**.
4. Use a busca para filtrar por nome, número do atleta ou equipe.
5. Em cada categoria, alterne entre **Todos** e **Por faixa etária**, expanda com **Ver todos** e use **Atualizar** para recarregar os dados.

A URL e o termo de busca ficam na barra de endereço, permitindo compartilhar o estado:

```
https://fellipeborges.github.io/melhor-resultado/?url=https%3A%2F%2Fwww.apuracaodetempos.com.br%2FResultados%2Frunrumoaohexa%2FResultados.html&q=SANDRUN
```

## Funcionalidades

- 4 categorias: Caminhada/Corrida × Feminino/Masculino
- Top 3 por categoria com opção de expandir
- Visualização por faixa etária (coluna Fx.Et.) com abas
- Filtro global por nome, número ou equipe
- Layout mobile-first, otimizado para celular
- Estado persistido na URL para compartilhamento

## Executar localmente

O projeto usa módulos ES e `fetch`, então não funciona abrindo `index.html` direto (`file://`). Use um servidor local:

```bash
npx serve .
```

Ou a extensão **Live Server** no VS Code/Cursor.

Acesse `http://localhost:3000` (ou a porta indicada).

## Limitações

- **CORS:** navegadores bloqueiam requisições diretas a sites de terceiros. A aplicação tenta fetch direto e, se falhar, usa um proxy CORS público (`api.allorigins.win`). Proxies gratuitos podem ser instáveis.
- **Formato:** compatível apenas com páginas no formato do apuracaodetempos.com.br (`.faixa-etaria` + `table.tabela-resultado`). Outras estruturas exibem alerta e não são processadas.
- **Encoding:** páginas fonte em windows-1252 são decodificadas automaticamente.