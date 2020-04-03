const puppeteer = require('puppeteer-core');
const { EventEmitter } = require('events');
const findChrome = require('./find-chrome');

class NavigatorEvents {

    constructor(options) {
        if (!options) options = {}
        this.browser = null;
        this.browserPath = options.browserPath;
        // this.interval = options.interval || 2000;
        this.navigatorEvents = new EventEmitter();
        this.startListening();
    }

    async startListening() {
        try {

            if (!this.browserPath) {
                const { executablePath } = await findChrome({});
                this.browserPath = executablePath;
            }

            this.browser = await puppeteer.launch(
                {
                    executablePath: this.browserPath,
                    // headless: false,
                    // ignoreDefaultArgs: ['--enable-automation']
                }
            );

            this.browser.on('disconnected', () => {
                this.navigatorEvents.emit('close');
            })

            const page = await this.browser.newPage();

            // page.on('console', msg => console.log(msg.text()));

            await page.exposeFunction('emitEventToNavigatorEvents', state => {
                this.navigatorEvents.emit(state);
            });

            // await page.exposeFunction('setIntervalForPolling', () => this.interval);

            await page.evaluateOnNewDocument(async () => {

                window.emitEventToNavigatorEvents(navigator.onLine ? 'true' : 'false');

                window.addEventListener('online', () => {
                    window.emitEventToNavigatorEvents('true');
                })

                window.addEventListener('offline', () => {
                    window.emitEventToNavigatorEvents('false');
                })

                // let state = navigator.onLine;
                // window.setInterval(() => {
                //     if (navigator.onLine !== state) {
                //         window.emitEventToNavigatorEvents(navigator.onLine);
                //         state = navigator.onLine;
                //     }
                // }, await window.setIntervalForPolling())
            });

            await page.goto('data:text/html,');
        } catch (err) {
            console.error(err.message);
        }
    }

    on(event, cb) {
        if (event === 'online') {
            this.navigatorEvents.on('true', () => {
                cb();
            });
        }
        if (event === 'offline') {
            this.navigatorEvents.on('false', () => {
                cb();
            });
        }
        if (event === 'close') {
            this.navigatorEvents.on('close', () => {
                cb();
            });
        }
    }

    async stopListening() {
        await this.browser.close();
    }
}

module.exports = new NavigatorEvents();
