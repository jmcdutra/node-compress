import fs from 'fs';
import path from 'path';
import imagemin from 'imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';
import ProgressBar from 'progress'; 
import inquirer from 'inquirer';  // interface cli

/**
 * Compresses all images in a given folder using imagemin.
 * @param {string} folderPath - The path to the folder containing the images to be compressed.
 * @param {object} options - The options for the compression process.
 * @param {number} options.quality - The quality of the compressed JPEG images (0-100).
 * @param {number} options.pngQuality - The quality of the compressed PNG images (0-1).
 * @returns {Promise<void>} - A Promise that resolves when all images have been compressed.
 */

async function compressImages(folderPath, options) {
    try {
        const backupFolder = path.join(folderPath, 'backup');
        const tempFolder = path.join(folderPath, 'temp');
        if (!fs.existsSync(backupFolder)) {
            fs.mkdirSync(backupFolder, { recursive: true });
        }
        if (!fs.existsSync(tempFolder)) {
            fs.mkdirSync(tempFolder, { recursive: true });
        }

        /**
         * Recursively processes a directory and compresses all images found within it.
         * @param {string} directory - The path to the directory to be processed.
         * @returns {Promise<void>} - A Promise that resolves when all images in the directory have been compressed.
         */
        async function processDirectory(directory) {
            const files = fs.readdirSync(directory);
            for (const file of files) {
                const filePath = path.join(directory, file);
                const stat = fs.statSync(filePath);
        
                if (stat.isDirectory()) {
                    if (file === 'backup' || file === 'temp') continue;
        
                    await processDirectory(filePath);
                } else if (/\.(png|jpe?g)$/i.test(filePath)) {
                    if (filePath.includes(path.join(directory, 'backup')) || filePath.includes(path.join(directory, 'temp'))) continue;
        
                    const compressedFiles = await imagemin([filePath], {
                        destination: path.join(tempFolder, path.relative(folderPath, directory)),
                        plugins: [
                            filePath.endsWith('.jpg') ?
                                imageminMozjpeg({ quality: options.quality }) :
                                imageminPngquant({ quality: options.pngQuality })
                        ]
                    }).catch(error => {
                        console.error(`\x1b[31mFalha ao comprimir ${filePath}: ${error.message}\x1b[0m`);
                    });

                    if (!compressedFiles || compressedFiles.length === 0) {
                        console.error(`\x1b[31mNenhum arquivo comprimido gerado para ${filePath}\x1b[0m`);
                        continue;
                    }

                    const compressedFile = compressedFiles[0];
                    if (!compressedFile || !compressedFile.destinationPath) {
                        console.error(`\x1b[31mO objeto de arquivo compactado está malformado para ${filePath}\x1b[0m`);
                        continue;
                    }

                    const backupPath = path.join(backupFolder, path.relative(folderPath, filePath));
                    fs.mkdirSync(path.dirname(backupPath), { recursive: true });
                    fs.copyFileSync(filePath, backupPath);
                    fs.unlinkSync(filePath);
                    fs.renameSync(compressedFile.destinationPath, filePath);
                    //console.log(`\x1b[32mComprimido ${filePath} para ${compressedFile.destinationPath}\x1b[0m`);
                    bar.tick();  // Atualiza a barra de progresso
                }
            }
        }

        const totalFiles = countFiles(folderPath);
        const bar = new ProgressBar('[:bar] :current/:total imagens processadas (:percent) faltando :etas', {
            complete: '=',
            incomplete: ' ',
            width: 30,
            total: totalFiles
        });

        await processDirectory(folderPath);
        
        if (fs.existsSync(tempFolder)) {
            fs.rmSync(tempFolder, { recursive: true });
        }

    } catch (error) {
        console.error(`\x1b[31mOcorreu um erro: ${error.message}\x1b[0m`);
        console.error(error.stack);
    }
}

function countFiles(directory) {
    let count = 0;
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const filePath = path.join(directory, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            count += countFiles(filePath);  // Recursivamente conta arquivos em subdiretórios
        } else if (/\.(png|jpe?g)$/i.test(filePath)) {
            count++;
        }
    }
    return count;
}

// compressImages('images/', {
//     quality: 40, // Qualidade da imagem de 0 a 100 para JPG, 100 sendo o melhor e maior arquivo gerado (não recomendado)
//     pngQuality: [0.3, 0.4],  // Qualidade da imagem para PNG de 0 a 1, 1 sendo o melhor e maior arquivo gerado (não recomendado)
//     strip: true // Remove metadados da imagem
// });

async function startCLI() {
    // Faça perguntas ao usuário
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'directory',
            message: 'Qual é o diretório das imagens?',
            default: 'images/',
            validate: (value) => fs.existsSync(value) || 'O diretório não existe, por favor, entre com um diretório válido.',
        },
        {
            type: 'input',
            name: 'quality',
            message: 'Qual é a qualidade desejada das imagens (0-100)?',
            default: '80',
            validate: (value) => !isNaN(value) && value >= 0 && value <= 100 || 'Por favor, entre com um valor válido.',
        },
        {
            type: 'list',
            name: 'strip',
            message: 'Deseja remover os metadados das imagens?',
            choices: [
                { name: 'Sim', value: true },
                { name: 'Não', value: false }
            ],
            default: 0
        }
    ]);

    const pngQuality = [(parseInt(answers.quality) - 10) / 100, parseInt(answers.quality) / 100];

    await compressImages(answers.directory, {
        quality: parseInt(answers.quality),
        pngQuality,
        strip: answers.strip
    });
}

// Inicie a interface CLI
startCLI();