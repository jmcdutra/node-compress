# Image Compressor CLI

Este projeto é uma ferramenta de linha de comando para comprimir imagens em um diretório especificado. Ele usa a biblioteca [imagemin](https://github.com/imagemin/imagemin) para comprimir imagens e oferece uma interface CLI amigável para especificar opções de compressão.

## Requisitos

- Node.js
- npm ou yarn

## Instalação

1. Clone este repositório para o seu local machine usando:
    ```bash
    git clone https://github.com/jmcdutra/node-compress.git
    ```
2. Navegue até o diretório do projeto:
    ```bash
    cd node-compress
    ```
3. Instale todas as dependências necessárias com:
    ```bash
    npm install
    ```

## Uso

Execute o seguinte comando no diretório do projeto para iniciar a interface CLI:

```bash
node index.js
```

A interface CLI irá guiá-lo através dos seguintes passos:

1. Especificando o diretório das imagens.
2. Definindo a qualidade de compressão desejada para as imagens JPEG e PNG.
3. Optando por remover ou não os metadados das imagens.

Uma barra de progresso será exibida no console enquanto as imagens estão sendo processadas.

## Opções de Compressão

- **Qualidade**: Para imagens JPEG, a qualidade pode ser especificada como um valor entre 0 e 100. Para imagens PNG, a qualidade é automaticamente calculada com base na qualidade JPEG especificada.
- **Remoção de Metadados**: Opte por remover ou não os metadados das imagens. Metadados são informações adicionais que são armazenadas junto com uma imagem, como informações de câmera, data de criação, localização, entre outras. Eles podem ser úteis para organizar e categorizar imagens, mas também podem aumentar o tamanho do arquivo. A opção de remoção de metadados permite que você escolha se deseja manter ou remover essas informações adicionais durante o processo de compressão de imagem.