# JogoAviao

Este projeto é um jogo 3D de avião desenvolvido com JavaScript e a biblioteca Three.js. A aplicação apresenta uma cena em primeira pessoa, com terreno, inimigos, tiros, colisões, itens de cura e uma interface de carregamento e pausa.

A estrutura do código está dividida em módulos separados para facilitar a organização. O arquivo principal, main.js, controla o fluxo do jogo, o ciclo de animação, os estados de pause e reinício, além de integrar os sistemas de câmera, áudio, inimigos, colisão e HUD.

Os demais arquivos são responsáveis por partes específicas do funcionamento do projeto, como:

- airplane.js: controle do avião do jogador, vida e invencibilidade.
- terrain.js: geração e atualização do terreno.
- enemy.js: lógica dos inimigos.
- shooting.js: sistema de disparos.
- collision.js: detecção de colisões.
- camera.js: movimentação e posicionamento da câmera.
- audio.js: reprodução de efeitos sonoros e música de fundo.
- health_pack.js: itens de recuperação de vida.
- target.js: criação da mira.
- loadingManager.js: controle da tela de carregamento.

Como executar:

1. Abra o projeto em um servidor local, como o Live Server do VS Code.
2. Acesse o arquivo index.html pelo navegador.
3. Aguarde o carregamento e clique em Iniciar para começar o jogo.

Controles principais:

- Tecla Esc: pausar o jogo.
- Clique na tela: voltar ao jogo após a pausa.
- Teclas 1, 2 e 3: alterar a velocidade do jogo.
- Tecla G: ativar ou desativar a invencibilidade.
- Tecla S: ligar ou desligar a música de fundo.
