import axios from 'axios';
import cheerio from 'cheerio';
import axiosform from 'axios-form';

import _ from 'lodash';

import moment from 'moment';

import queryString from 'query-string';

import fs from 'fs';

import { Ticket } from '../typings/ticket';

enum SourceEnum {
    Sso = 'sso'
}

async function start() {
    let datas: Ticket[] = [];
    let time = moment();

    for (let i = 0; i < 6; i++) {
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

    fs.writeFileSync('./src/data/sso.json', JSON.stringify(datas, null, 4), 'utf8');
}

async function getData(year: number, month: number) {
    let result: Ticket[] = [];
    try {
        let res = await axios.get(`http://www.shsymphony.com/?m=index&a=hall_calendar&d=${year}-${month}`, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (res.data && res.data.data && res.data.data.length) {
            res.data.data.forEach(t => {
                result.push({
                    title: t.title,
                    date: [moment(t.time).toDate()],
                    url: `http://www.shsymphony.com/item-index-id-${t.id}.html`,
                    source: SourceEnum.Sso,
                    cover: `http://www.shsymphony.com${t.img}`,
                    hall: t.seat
                })
            })
        }
    } catch (e) {

    }

    return result;
}

export default start;