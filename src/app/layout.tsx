import './globals.css';

export const metadata = {
  title: 'Livo AI Pronunciation Assessor',
  description: 'DPDP-compliant speech evaluation engine',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
