"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = __importDefault(require("cheerio"));
const lodash_1 = __importDefault(require("lodash"));
const moment_1 = __importDefault(require("moment"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ticket_1 = require("../types/ticket");
async function start() {
    let datas = [];
    let time = moment_1.default();
    for (let i = 0; i < 6; i++) {
        (await getData(time.year(), time.month() + 1)).forEach(t => {
            let existData = datas.find(p => p.url === t.url);
            if (existData) {
                existData.date = existData.date.concat(t.date);
            }
            else {
                datas.push(t);
            }
        });
        time = time.add(1, 'M');
    }
    fs_1.default.writeFileSync(path_1.default.resolve(__dirname, '../../data/sso.json'), JSON.stringify(datas, null, 4), 'utf8');
}
async function getData(year, month) {
    let result = [];
    try {
        let res = await axios_1.default.get(`http://www.shsymphony.com/?m=index&a=hall_calendar&d=${year}-${month}`, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        if (res.data && res.data.data && res.data.data.length) {
            res.data.data.forEach(t => {
                result.push({
                    title: t.title,
                    date: [{
                            date: moment_1.default(t.time).toDate()
                        }],
                    url: `http://www.shsymphony.com/item-index-id-${t.id}.html`,
                    source: ticket_1.SourceEnum.Sso,
                    cover: `http://www.shsymphony.com${t.img}`,
                    hall: t.seat
                });
            });
        }
    }
    catch (e) {
    }
    return result;
}
async function getDetails() {
    let datas = require('../../data/sso.json');
    for (let i = 0; i < datas.length / 5; i++) {
        let tasks = [];
        for (let j = 0; j < 5; j++) {
            if (i * 5 + j < datas.length) {
                tasks.push(getDetail(datas[i * 5 + j]));
            }
        }
        await Promise.all(tasks);
    }
    fs_1.default.writeFileSync(path_1.default.resolve(__dirname, '../../data/sso.json'), JSON.stringify(datas, null, 4), 'utf8');
}
exports.getDetails = getDetails;
async function getDetail(t) {
    return axios_1.default.get(t.url).then(response => {
        let $ = cheerio_1.default.load(response.data);
        let prices = $('.price-span-seat');
        if (t.date && t.date[0]) {
            t.date[0].price = lodash_1.default.map(prices, (p) => {
                let $p = $(p);
                return {
                    price: parseInt($p.text()),
                    isSoldOut: $p.text().indexOf('售罄') > -1
                };
            });
        }
        let $desc = $('.page_tab_content_2 .ft14');
        if ($desc.length) {
            t.description = $desc.text();
        }
        return 1;
    });
}
exports.default = start;
//# sourceMappingURL=sso.js.map