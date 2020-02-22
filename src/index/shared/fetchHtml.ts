import fetch from 'node-fetch';

const fetchHtml = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const html = await response.text();
    return html;
};

export default fetchHtml;
