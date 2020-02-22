import cheerio from 'cheerio';
import moment from 'moment';
import fetchHtml from './shared/fetchHtml';
import { CALENDAR_URL } from './shared/urls';

const stripDateRegex = /[^0-9.-]/g;
const timeFilterRegex = /[0-9]{2}:[0-9]{2}/g;
const timeRemovalRegex = /[0-9]{2}:[0-9]{2}.*Uhr/gi;
const duplicateWhiteSpaceRegex = /[\s]{2,}/g;

const removeDuplicateWhiteSpace = (str: string): string =>
    str.replace(duplicateWhiteSpaceRegex, ' ');

interface CalendarEntry {
    startDate: Date;
    endDate: Date | null;
    text: string;
    times: TimePeriod[] | null;
}

interface TimePeriod {
    start: string;
    end: string | null;
}

const getCalendar = async (): Promise<CalendarEntry[]> => {
    const calendarHtml = await fetchHtml(CALENDAR_URL);
    const $ = cheerio.load(calendarHtml);

    const dates = $('.td-0');
    const texts = $('.td-1');

    const calendarEntries: CalendarEntry[] = [];

    for (let i = 0; i < texts.length; i++) {
        const dateString = dates[i].firstChild.data;
        const strippedDateString =
            dateString?.replace(stripDateRegex, '') ?? '';

        const [startDateString, endDateString] = strippedDateString.split('-');

        let startDate: Date;
        let endDate: Date | null;

        if (startDateString) {
            startDate = moment(startDateString, 'DD.MM.YYYY')
                .utc()
                .toDate();
        } else {
            startDate = calendarEntries[calendarEntries.length - 1].startDate;
        }

        if (endDateString) {
            endDate = moment(endDateString, 'DD.MM.YYYY')
                .utc()
                .toDate();
        } else {
            endDate = null;
        }

        const text = texts[i].firstChild.data ?? '';

        const extractedTimes = text.match(timeFilterRegex) ?? [];

        const times: TimePeriod[] = [];

        for (let i = 0; i < extractedTimes.length; i += 2) {
            times.push({
                start: extractedTimes[i],
                end: extractedTimes[i + 1] ?? null,
            });
        }

        const textWithoutTimes = removeDuplicateWhiteSpace(
            text.replace(timeRemovalRegex, '').replace(timeFilterRegex, ''),
        ).trim();

        if (startDate && textWithoutTimes) {
            const entry = {
                startDate,
                endDate,
                text: textWithoutTimes,
                times,
            };

            calendarEntries.push(entry);
        }
    }

    return calendarEntries;
};

export default getCalendar;
