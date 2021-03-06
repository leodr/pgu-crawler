import cheerio from 'cheerio';
import moment from 'moment';
import encodeImageToBlurhash from './getNews/encodeImageToBlurhash';
import fetchHtml from './shared/fetchHtml';
import { NEWS_URL, relativeToAbsoluteUrl } from './shared/urls';

const afterSlashUrlRegex = /\/([^/]+)\/?$/;
const matchContentRegex = /<hr class="cl-right"[\s/]*>(.*)<hr class="cl-right"[\s/]*>/gis;

const getArticleUrls = async (): Promise<string[]> => {
    const html = await fetchHtml(NEWS_URL);
    const $ = cheerio.load(html);
    const newsElements = $('.news-list-item > a');

    return newsElements
        .map((_, el) => {
            return el.attribs.href;
        })
        .get();
};

interface NewsArticle {
    url: string;
    title: string;
    content: string;
    date: Date;
    images: NewsImage[];
    slug: string;
}

interface NewsImage {
    url: string;
    blurHash: string;
    width: number;
    height: number;
}

const getNews = async (): Promise<NewsArticle[]> => {
    const articleUrls = await getArticleUrls();

    const articleObjects = articleUrls.map(async (url) => {
        const afterSlashUrl = url?.match(afterSlashUrlRegex)?.[1] ?? '';
        const slug = afterSlashUrl.replace('.html', '');

        const html = await fetchHtml(url);
        const $ = cheerio.load(html);
        const newsItem = $('.news-single-item');
        const title = newsItem.find('h1').text();
        const releaseDate = newsItem
            .find('.news-single-rightbox')
            .text()
            .trim();

        const [dateString, timeString] = releaseDate.split(' ');

        const date = moment(`${dateString} ${timeString}`, 'DD-MM-YY HH:mm')
            .utcOffset(60)
            .toDate();

        const contentMatches = html?.match(matchContentRegex);

        const contentAsHtml = (contentMatches?.[0] ?? '')
            .replace(/<hr class="cl-right"[\s/]*>/g, '')
            .replace(/<div class="news-single-img">.*?<\/div>/gi, '')
            .trim();

        const contentSelector = cheerio.load(contentAsHtml);
        contentSelector('a').each((_, e) => {
            e.attribs.href = relativeToAbsoluteUrl(e.attribs.href);
        });
        contentSelector('img').each((_, e) => {
            e.attribs.src = relativeToAbsoluteUrl(e.attribs.src);
        });

        contentSelector('p').each((_, e) => {
            const $this = $(e);
            if (!$this?.html()?.replace(/\s|&nbsp;/g, '').length) {
                $this.remove();
            }
        });

        const content = contentSelector.html();

        const imageElements = $('.news-single-img a');

        const imageUrls = imageElements
            .map((_, e) => relativeToAbsoluteUrl(e.attribs.href))
            .get();

        const images = await Promise.all(
            imageUrls.map(
                async (imageUrl): Promise<NewsImage> => {
                    const html = await fetchHtml(imageUrl);
                    const $ = cheerio.load(html);

                    const cmsImageUrl = relativeToAbsoluteUrl(
                        $('img').attr('src') ?? ''
                    );

                    const {
                        width,
                        height,
                        blurHash,
                    } = await encodeImageToBlurhash(cmsImageUrl);

                    return {
                        url: imageUrl,
                        blurHash,
                        width,
                        height,
                    };
                }
            )
        );

        return {
            url,
            title,
            content,
            date,
            images,
            slug,
        };
    });

    const articles = await Promise.all(articleObjects);

    return articles;
};

export default getNews;
