import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale;

    // Default to 'ar' if no locale is provided
    if (!locale || !['ar', 'fr', 'en', 'de', 'tr', 'tam'].includes(locale)) {
        locale = 'ar';
    }

    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default
    };
});
