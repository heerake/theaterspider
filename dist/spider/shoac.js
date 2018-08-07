"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = __importDefault(require("cheerio"));
const axios_form_1 = __importDefault(require("axios-form"));
const lodash_1 = __importDefault(require("lodash"));
const moment_1 = __importDefault(require("moment"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ticket_1 = require("../types/ticket");
async function start() {
    console.log(new Date(), '开始爬取东方艺术中心列表');
    let datas = [];
    let startDate = new Date();
    for (let i = 0; i < 30; i++) {
        let endDate = new Date(+startDate);
        endDate.setDate(endDate.getDate() + 10);
        (await getData(startDate, endDate)).forEach(t => {
            let existTicket = datas.find(p => p.title === t.title);
            if (existTicket) {
                existTicket.date = lodash_1.default.union(existTicket.date, t.date);
            }
            else {
                datas.push(t);
            }
        });
        startDate = new Date(+endDate);
        startDate.setDate(startDate.getDate() + 1);
    }
    fs_1.default.writeFileSync(path_1.default.resolve(__dirname, '../../data/shoac.json'), JSON.stringify(datas, null, 4), 'utf8');
    console.log(new Date(), '东方艺术中心列表爬取完毕');
}
async function getData(startDate, endDate) {
    let tickets = [];
    try {
        let res = await axios_form_1.default('http://www.shoac.com.cn/ProgramSearchHandler.ashx', {
            fun: 'getdata',
            begin_date: moment_1.default(startDate).format('YYYY-MM-DD'),
            end_date: moment_1.default(endDate).format('YYYY-MM-DD'),
            category_id: '',
            venue_name: '',
            key: '',
            price: '',
            index: 1,
            xilie: ''
        });
        let $ = cheerio_1.default.load(res.data.html);
        $('li').each(function () {
            let as = $(this).find('a');
            let dateStr = $(this).find('.tim .dd').text();
            let dateStrs = dateStr.split('-');
            //获取时间段
            let dateTimes = dateStrs.map(t => {
                let match = t.match(/(\d+)月(\d+)日/);
                if (!match) {
                    return new Date();
                }
                let year = match[1] == startDate.getMonth().toString() ? startDate.getFullYear() : endDate.getFullYear();
                return new Date(year, parseInt(match[1]) - 1, parseInt(match[2]));
            });
            if (dateTimes.length > 1) {
                let tempDates = [];
                let startDate = dateTimes[0];
                let endDate = dateTimes[1];
                while (startDate <= endDate) {
                    tempDates.push(new Date(+startDate));
                    startDate.setDate(startDate.getDate() + 1);
                }
            }
            let datePrice = dateTimes.map(t => {
                return {
                    date: t
                };
            });
            tickets.push({
                title: $(as[1]).text(),
                date: datePrice,
                url: `http://www.shoac.com.cn/${$(as[0]).attr('href')}`,
                source: ticket_1.SourceEnum.Shoac
            });
        });
    }
    catch (e) {
        console.log(e);
    }
    return tickets;
}
async function getDetails() {
    let datas = require('../../data/shoac.json');
    for (let i = 0; i < datas.length / 5; i++) {
        let tasks = [];
        for (let j = 0; j < 5; j++) {
            if (i * 5 + j < datas.length) {
                tasks.push(getDetail(datas[i * 5 + j]));
            }
        }
        await Promise.all(tasks);
    }
    fs_1.default.writeFileSync(path_1.default.resolve(__dirname, '../../data/shoac.json'), JSON.stringify(datas, null, 4), 'utf8');
}
exports.getDetails = getDetails;
async function getDetail(t) {
    return axios_1.default.get(t.url).then(response => {
        let $ = cheerio_1.default.load(response.data);
        let $hall = $('#venue_name');
        if ($hall.length) {
            t.hall = $hall.text();
        }
        let $youhui = $('#youhuidiv #remark_cn');
        if ($youhui.length) {
            t.remark = $youhui.text();
        }
        let $content = $('#program_content_cn');
        if ($content.length) {
            t.description = $content.text();
        }
        let $img = $('.img-wrapper img');
        if ($img.length) {
            t.cover = `http://www.shoac.com.cn${$img.attr('src')}`;
        }
        let $dates = $('#scene_sel .ite');
        if ($dates.length) {
            t.date = lodash_1.default.map($dates, (t, index) => {
                let $t = $(t);
                let ymd = $t.find('.y-m-d').text();
                let md = $t.find('.w-t').text().split(String.fromCharCode(160))[1];
                let clickText = $t.attr('onclick');
                let priceMatch = clickText.match(/\"([0-9|/]+\")/);
                let prices = null;
                if (priceMatch) {
                    let priceInfos = priceMatch[1].split('/');
                    prices = priceInfos.map(t => {
                        return {
                            price: parseInt(t.split('|')[0]),
                            isSoldOut: t.split('|')[1] === '1'
                        };
                    });
                }
                return {
                    date: moment_1.default(`${ymd} ${md}`).toDate(),
                    price: prices
                };
            });
        }
        return 1;
    });
}
exports.default = start;
//# sourceMappingURL=shoac.js.map