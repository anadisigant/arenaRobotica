# Arena Robótica

Aplicativo para campeonatos curtos de robótica com duas ferramentas:

- cronômetro simultâneo para os times Amarelo e Laranja;
- sorteador de 28 bandeiras com representação em matriz LED 3×3 e cor de acionamento do sensor.

O projeto utiliza Next.js e está preparado para publicação na Vercel. Não há banco de dados nem variáveis de ambiente obrigatórias. Os resultados do cronômetro e o histórico dos sorteios são guardados no navegador de cada dispositivo.

## Publicar diretamente pela Vercel CLI

1. Descompacte o arquivo.
2. Abra um terminal dentro da pasta `arena-robotica-vercel`.
3. Instale as dependências:

   ```bash
   npm install
   ```

4. Entre na sua conta da Vercel e publique:

   ```bash
   npx vercel --prod
   ```

5. Confirme as opções sugeridas. A Vercel detectará automaticamente o framework Next.js.

## Publicar pelo painel da Vercel

1. Descompacte o arquivo e envie o conteúdo para um repositório no GitHub, GitLab ou Bitbucket.
2. No painel da Vercel, selecione **Add New → Project**.
3. Importe o repositório.
4. Confirme **Framework Preset: Next.js**.
5. Mantenha os valores automáticos:
   - Build Command: `npm run build`;
   - Output Directory: padrão do Next.js;
   - Install Command: `npm install`.
6. Clique em **Deploy**.

## Executar localmente

```bash
npm install
npm run dev
```

Depois, acesse `http://localhost:3000`.

## Rotas

- `/` — cronômetro da competição;
- `/bandeiras` — sorteador de bandeiras e matrizes 3×3.
