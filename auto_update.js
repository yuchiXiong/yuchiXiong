// @ts-check
const fs = require('fs');
const axios = require('axios');
const dayjs = require('dayjs');
const Parser = require('rss-parser');

const PLACE_HOLDER = "{{AUTO_UPDATE_PLACE_HOLDER}}";
const temp = fs.readFileSync('./README_TEMP.md', 'utf-8');

/** 拉取我的博客列表 */
const blogSection = async () => {
  const BLOG_RSS = "https://xiongyuchi.top/atom.xml";
  const parser = new Parser();

  const response = await axios({
    url: BLOG_RSS,
    method: 'get',
  });

  const data = response?.data;
  if (!data) return;

  const result = await parser.parseString(data);

  const blogs = result.items.map(i => ({
    title: i.title,
    link: i.link,
    pubDate: i.pubDate
  }));

  const today = new Date();
  const ONE_YEAR = 12 * 30 * 24 * 60 * 60 * 1000;
  // const ONE_HALF_YEAR = 6 * 30 * 24 * 60 * 60 * 1000;

  const lastMonthBlogs = blogs.filter(blog => {
    const pubDate = new Date(blog.pubDate);

    return (today.getTime() - ONE_YEAR) <= pubDate.getTime()
  });


  const markdown = ['#### Recent Blogs'].concat(lastMonthBlogs.map(blog => {
    return `[${blog.title}](${blog.link}) - ${dayjs(blog.pubDate).format('YYYY-MM-DD')}`;
  })).join('\n\n');


  return markdown;
}

/** 拉取我的豆瓣 */
const doubanSection = async () => {
  const DOUBAN_RSS = "https://www.douban.com/feed/people/202743447/interests";
  const parser = new Parser();

  const response = await axios({
    url: DOUBAN_RSS,
    method: 'get',
  });

  const data = response?.data;
  if (!data) return;

  const result = await parser.parseString(data);

  const interests = result.items.map(i => ({
    title: i.title,
    link: i.link,
    pubDate: i.pubDate
  }));

  const today = new Date();
  const ONE_YEAR = 12 * 30 * 24 * 60 * 60 * 1000;
  // const ONE_HALF_YEAR = 6 * 30 * 24 * 60 * 60 * 1000;

  const lastMonthBlogs = interests.filter(interest => {
    const pubDate = new Date(interest.pubDate);

    return (today.getTime() - ONE_YEAR) <= pubDate.getTime()
  }).filter(interest => {
    return interest.title?.includes("最近在读") || interest.title?.includes("最近读过")
  });


  const markdown = ['#### Recent Digests'].concat(lastMonthBlogs.map(blog => {
    return `[${blog.title}](${blog.link}) - ${dayjs(blog.pubDate).format('YYYY-MM-DD')}`;
  })).join('\n\n');


  return markdown;
}

(async () => {
  const blog = await blogSection();
  const douban = await doubanSection();

  const content = [
    blog,
    douban
  ].join('\n\n');


  const newReadme = temp.replace(PLACE_HOLDER, content);
  fs.writeFileSync('README.md', newReadme, 'utf-8')
})();