import createNextIntlPlugin from 'next-intl/plugin';

// Print login info on startup for convenience
console.log('\x1b[36m%s\x1b[0m', '----------------------------------------------------------');
console.log('\x1b[36m%s\x1b[0m', '🚀 SCHOOL MANAGEMENT SYSTEM - FRONTEND 2 READY');
console.log('\x1b[33m%s\x1b[0m', 'Default Login Credentials:');
console.log('  Director: admin / password123');
console.log('  Teacher:  teacher_MATH / teacher123');
console.log('  Student:  student123 (Generic password)');
console.log('\x1b[36m%s\x1b[0m', '----------------------------------------------------------');

const withNextIntl = createNextIntlPlugin(
    './src/i18n/request.ts'
);

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withNextIntl(nextConfig);
