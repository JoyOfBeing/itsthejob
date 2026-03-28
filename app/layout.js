import "./globals.css";

export const metadata = {
  title: "J.O.B. — The New Human Resources",
  description: "What becomes possible when being human is the job?",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
