import { AuthProvider } from "@/lib/AuthContext";
import "./globals.css";

export const metadata = {
  title: "rire.ci — La comédie ivoirienne",
  description: "Découvre et soutiens les meilleurs comédiens de Côte d'Ivoire",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}