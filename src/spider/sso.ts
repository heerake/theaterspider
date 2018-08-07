import axios from 'axios';
import cheerio from 'cheerio';
import axiosform from 'axios-form';

import _ from 'lodash';

import moment from 'moment';

import queryString from 'query-string';

import fs from 'fs';
import path from 'path';

import { Ticket, SourceEnum, DatePrice } from '../types/ticket';

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

  fs.writeFileSync(path.resolve(__dirname, '../../data/sso.json'), JSON.stringify(datas, null, 4), 'utf8');
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
          date: [{
            date: moment(t.time).toDate()
          }],
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

async function getDetails() {
  let datas = require('../../data/sso.json') as Ticket[];

  for (let i = 0; i < datas.length / 5; i++) {
    let tasks: Promise<any>[] = [];
    for (let j = 0; j < 5; j++) {
      if (i * 5 + j < datas.length) {
        tasks.push(getDetail(datas[i * 5 + j]));
      }
    }

    await Promise.all(tasks);
  }

  fs.writeFileSync(path.resolve(__dirname, '../../data/sso.json'), JSON.stringify(datas, null, 4), 'utf8');
}

async function getDetail(t: Ticket) {
  return axios.get(t.url).then(response => {
    let $ = cheerio.load(response.data);

    let prices = $('.price-span-seat');
    if (t.date && t.date[0]) {
      t.date[0].price = _.map(prices, (p) => {
        let $p = $(p);
        return {
          price: parseInt($p.text()),
          isSoldOut: $p.text().indexOf('售罄') > -1
        }
      })
    }

    let $desc = $('.page_tab_content_2 .ft14');
    if ($desc.length) {
      t.description = $desc.text()
    }

    return 1;
  })
}

export default start;
export { getDetails }