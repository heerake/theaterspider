import axios from 'axios';
import cheerio from 'cheerio';
import axiosform from 'axios-form';

import _ from 'lodash';

import moment from 'moment';

import queryString from 'query-string';

import fs from 'fs';

import { Ticket } from '../typings/ticket';
//import { SourceEnum } from '../typings/sourceEnum';

enum SourceEnum {
    Shoac = 'shoac'
}
async function start() {
    let datas: Ticket[] = [];
    let startDate = new Date();

    for (let i = 0; i < 30; i++) {
        let endDate = new Date(+startDate);
        endDate.setDate(endDate.getDate() + 10);

        (await getData(startDate, endDate)).forEach(t => {
            let existTicket = datas.find(p => p.title === t.title);
            if (existTicket) {
                existTicket.date = _.union(existTicket.date, t.date);
            } else {
                datas.push(t);
            }
        })

        startDate = new Date(+endDate);
        startDate.setDate(startDate.getDate() + 1);
    }

    console.log(datas);
    console.log(JSON.stringify(datas));

    fs.writeFileSync('shoac.json', JSON.stringify(datas, null, 4), 'utf8');
}

async function getData(startDate: Date, endDate: Date) {
    let tickets: Ticket[] = [];
    try {
        let res = await axiosform('http://www.shoac.com.cn/ProgramSearchHandler.ashx', {
            fun: 'getdata',
            begin_date: moment(startDate).format('YYYY-MM-DD'),
            end_date: moment(endDate).format('YYYY-MM-DD'),
            category_id: '',
            venue_name: '',
            key: '',
            price: '',
            index: 1,
            xilie: ''
        });

        let $ = cheerio.load(res.data.html);

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
                let tempDates: Date[] = [];
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
        })
    } catch (e) {
        console.log(e);
    }

    return tickets;
}

export default start;