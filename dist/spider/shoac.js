"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = __importDefault(require("cheerio"));
const axios_form_1 = __importDefault(require("axios-form"));
const lodash_1 = __importDefault(require("lodash"));
const moment_1 = __importDefault(require("moment"));
const fs_1 = __importDefault(require("fs"));
//import { SourceEnum } from '../typings/sourceEnum';
var SourceEnum;
(function (SourceEnum) {
    SourceEnum["Shoac"] = "shoac";
})(SourceEnum || (SourceEnum = {}));
async function start() {
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
    console.log(datas);
    console.log(JSON.stringify(datas));
    fs_1.default.writeFileSync('shoac.json', JSON.stringify(datas, null, 4), 'utf8');
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
            tickets.push({
                title: $(as[1]).text(),
                date: dateTimes,
                url: `http://www.shoac.com.cn/${$(as[0]).attr('href')}`,
                source: SourceEnum.Shoac
            });
        });
    }
    catch (e) {
        console.log(e);
    }
    return tickets;
}
exports.default = start;
//# sourceMappingURL=shoac.js.map