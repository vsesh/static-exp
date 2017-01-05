const express = require('express');
const phantom = require('phantom');
const fs = require('fs');

const app = express();

const FILE_NAME = 'file.png';

app.get('/', (req, res) => {

    let phInstance;
    let phPage;

    phantom.create([], {
            // Необходимость
            // Никакие переменные нельзя передать в другой процесс фантома.
            logger: {
                info: function (action) {
                    if (action === 'complete') {
                        // Пока сохраняем в файл.
                        // Метода renderBuffer не сущесвует хоть он и описан в доке.
                        phPage.render(FILE_NAME).then(() => {
                            res
                                .set('Content-Type', 'image/png')
                                .status(200)
                                .send(fs.readFileSync(FILE_NAME));
                            phInstance.exit();
                        })
                    }
                }
            }
        })
        .then(instance => {
            phInstance = instance;
            return instance.createPage();
        })
        .then(page => {

            phPage = page;

            page.property('viewportSize', {
                width: 640,
                height: 480
            });

            // Этот callback будет скопирован как текст.
            // Далее он будет запущен в другом процессе.
            // То есть никакие переменные нельзя передать
            page.property('onCallback', function (data) {
                console.log('complete');
            });

            return page.open('index.html');
        });

});

app.listen(8787);
