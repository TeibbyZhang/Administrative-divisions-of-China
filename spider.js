const app = require('express')();
const request = require('superagent');
const cheerio = require('cheerio');

const db = require('./db');

const provinces = [];
const cities = [];
const areas = [];

const baseUrl = 'http://www.stats.gov.cn/tjsj/tjbz/tjyqhdmhcxhfdm/2018/{#code}.html';

app.get('/', (req, res) => {
  console.log('[1/1]正在抓取省市区县行政区划数据！');
  request
    .get('http://www.mca.gov.cn/article/sj/xzqh/1980/201903/201903011447.html')
    .set({'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36'})
    .end((error, response) => {
    if (!error && response.statusCode === 200) {
      console.log('正在处理省市区县的数据！');
      const $ = cheerio.load(response.text);
      $('table tr').each((index, element) => {
        if (index < 3) {
          // 标题等无关数据
          return undefined;
        }
        const xzqh = $(element).children('td').eq(1).text().trim();
        const name = $(element).children('td').eq(2).text().trim();
        if (xzqh.slice(2, 4) === '00') {
          // 省级
          provinces.push({xzqh, name, children: []});
        } else if (xzqh.slice(4) === '00') {
          // 市级
          cities.push({xzqh, name, children: []});
          provinces[provinces.length - 1].children.push(cities[cities.length - 1]);
        } else if ((/[0-9]{6}/).test(xzqh)) {
          // 区县
          areas.push({xzqh, name});
          if (cities[cities.length - 1] && cities[cities.length - 1].xzqh.slice(0, 4) === xzqh.slice(0, 4)) {
            // 非直辖市
            cities[cities.length - 1].children.push(areas[areas.length - 1]);
          } else {
            // 直辖市
            provinces[provinces.length - 1].children.push(areas[areas.length - 1]);
          }
        }
      });
      console.log('省市区县数据处理完毕！');
      console.log(`省市区县行政区划抓取完毕，共有${provinces.length}个省、${cities.length}个市、${areas.length}个区县`);
      console.log('[1/2]正在将区县数据写入数据库！');
      provinces.forEach(province => {
        if (province.children.every(item => item.xzqh.slice(4) !== '00')) {
          province.children.forEach(area => {
            db.addData({code: area.xzqh, name: area.name, pCode: province.xzqh});
          });
        }
      })
      cities.forEach(city => {
        city.children.forEach(area => {
          db.addData({code: area.xzqh, name: area.name, pCode: city.xzqh});
        });
      });
      res.send(provinces);
    }
  });
});

app.listen(3000);