import axios from 'axios';
import cheerio from 'cheerio';
import axiosform from 'axios-form';

import _ from 'lodash';

import moment from 'moment';

import queryString from 'query-string';

import fs from 'fs';

import { Ticket } from '../typings/ticket';

enum SourceEnum {
    Sgt = 'sgt'
}

async function start() {
    let datas: Ticket[] = [];
    let time = moment();

    for (let i = 0; i < 12; i++) {
        (await getData(time.year(), time.month() + 1)).forEach(t => {
            let existData = datas.find(p => p.url === t.url);
            if (existData) {
                existData.date = existData.date.concat(t.date);
            } else {
                datas.push(t);
            }
        })

        time = time.add(1, 'M');
    }

    console.log(datas);
    console.log(JSON.stringify(datas));

    fs.writeFileSync('./src/data/sgt.json', JSON.stringify(datas, null, 4), 'utf8');
}

async function getData(year: number, month: number) {
    let result: Ticket[] = [];
    try {
        let res = await axios.get(`http://www.shgtheatre.com/calendar_date_data.php?year=${year}&month=${month}`);

        if (res.data && res.data.length) {
            res.data.forEach(t => {
                result.push({
                    title: t.project_name,
                    date: [moment(t.project_st_time).toDate()],
                    url: `http://www.shgtheatre.com/plus/view.php?aid=${t.aid}`,
                    source: SourceEnum.Sgt
                })
            })
        }
    } catch (e) {

    }

    return result;
}

export default start;