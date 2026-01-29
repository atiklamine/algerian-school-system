import type { Metadata } from "next";
import ThemeRegistry from "@/theme/ThemeRegistry";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import dynamic from 'next/dynamic';

const RequestProvider = dynamic(() => import('@/components/common/RequestProvider').then(m => m.RequestProvider), { ssr: false });

export const metadata: Metadata = {
  title: "School Management System",
  description: "Secure and Premium School Management Dashboard",
};

export default async function RootLayout({
  children,
  params: { locale }
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ThemeRegistry locale={locale}>
            <RequestProvider>
              {children}
            </RequestProvider>
          </ThemeRegistry>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
