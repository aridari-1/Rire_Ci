import { AuthProvider } from "@/lib/AuthContext";
import AppLayout from "@/components/AppLayout";
import "./globals.css";

export const metadata = {
  title: "rire.ci — La comédie ivoirienne",
  description: "Découvre et soutiens les meilleurs comédiens de Côte d'Ivoire",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css" />
      </head>
      <body>
        <AuthProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </AuthProvider>
      </body>
    </html>
  );
}