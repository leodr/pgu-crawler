import cheerio from 'cheerio';
import fetchHtml from './shared/fetchHtml';
import { CANTEEN_URL } from './shared/urls';

const getCanteen = async (): Promise<string> => {
    const html = await fetchHtml(CANTEEN_URL);
    const $ = cheerio.load(html);

    const imageElement = $("table[name='ForumLinks']").find('img');

    const imageUrl = imageElement.attr('src') ?? '';

    return imageUrl;
};

export default getCanteen;
