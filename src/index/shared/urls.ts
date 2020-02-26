export const BASE_URL = 'http://www.pgu.de';

export const NEWS_URL = `${BASE_URL}/fileadmin/Vertretungsplan/Neu/Forum_4.php`;

export const CALENDAR_URL = `${BASE_URL}/fileadmin/Vertretungsplan/Neu/Forum_3.php`;

export const CANTEEN_URL = `${BASE_URL}/fileadmin/Vertretungsplan/Neu/Forum_5.php`;

export const relativeToAbsoluteUrl = (relativeUrl: string): string => {
    return `${BASE_URL}/${relativeUrl}`;
};
