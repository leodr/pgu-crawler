import cheerio from 'cheerio';
import fetch from 'node-fetch';

const NEWS_URL = 'http://www.pgu.de/fileadmin/Vertretungsplan/Neu/Forum_4.php';

const fetchHTML = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const html = await response.text();
    return html;
};

const getArticleUrls = async (): Promise<string[]> => {
    const html = await fetchHTML(NEWS_URL);
    const $ = cheerio.load(html);
    const newsElements = $('.news-list-item > a');

    return newsElements
        .map((i, el) => {
            return el.attribs.href;
        })
        .get();
};

const main = async () => {
    const articleUrls = await getArticleUrls();

    const articleObjects = articleUrls.map(async url => {
        const html = await fetchHTML(url);
        const $ = cheerio.load(html);
        const newsItem = $('.news-single-item');
        const heading = newsItem.find('h1').text();
        const date = newsItem
            .find('.news-single-rightbox')
            .text()
            .trim();
        const children = $('.news-single-item > hr').first.nextUntil('hr');

        return { heading, date };
    });

    console.log(await Promise.all(articleObjects));
};

main();
