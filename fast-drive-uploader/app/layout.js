export const metadata = {
  title: 'Fast Drive Uploader',
  description: 'Upload files quickly to Google Drive',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}