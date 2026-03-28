import "./globals.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export const metadata = {
  title: "EasyTask — Focus Assistant",
  description: "Your daily focus assistant",
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