"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const moment_1 = __importDefault(require("moment"));
const fs_1 = __importDefault(require("fs"));
var SourceEnum;
(function (SourceEnum) {
    SourceEnum["Sgt"] = "sgt";
})(SourceEnum || (SourceEnum = {}));
async function start() {
    let datas = [];
    let time = moment_1.default();
    for (let i = 0; i < 12; i++) {
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
    console.log(datas);
    console.log(JSON.stringify(datas));
    fs_1.default.writeFileSync('./src/data/sgt.json', JSON.stringify(datas, null, 4), 'utf8');
}
async function getData(year, month) {
    let result = [];
    try {
        let res = await axios_1.default.get(`http://www.shgtheatre.com/calendar_date_data.php?year=${year}&month=${month}`);
        if (res.data && res.data.length) {
            res.data.forEach(t => {
                result.push({
                    title: t.project_name,
                    date: [moment_1.default(t.project_st_time).toDate()],
                    url: `http://www.shgtheatre.com/plus/view.php?aid=${t.aid}`,
                    source: SourceEnum.Sgt
                });
            });
        }
    }
    catch (e) {
    }
    return result;
}
exports.default = start;
//# sourceMappingURL=sgt.js.map