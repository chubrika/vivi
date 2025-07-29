import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import NavbarWrapper from '../components/NavbarWrapper';
import AuthProviderWrapper from '../components/AuthProviderWrapper';
import CartProviderWrapper from '../components/CartProviderWrapper';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';
import { CategoryMenuProvider } from '../contexts/CategoryMenuContext';
import { LoginSidebarProvider } from '../contexts/LoginSidebarContext';
import LoginSidebarWrapper from '../components/LoginSidebarWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'vivi.ge',
  description: 'Your one-stop shop for all your needs',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} font-sans`}>
        <AuthProviderWrapper>
          <CartProviderWrapper>
            <CategoryMenuProvider>
              <LoginSidebarProvider>
                <div className="flex flex-col min-h-screen">
                  <NavbarWrapper />
                  <main className="flex-grow mt-[100px] md:mt-[130px] pb-16 md:pb-0">
                    {children}
                  </main>
                  <MobileBottomNav />
                  <Footer />
                </div>
                <LoginSidebarWrapper />
              </LoginSidebarProvider>
            </CategoryMenuProvider>
          </CartProviderWrapper>
        </AuthProviderWrapper>
        
        {/* Tawk.to Chat Script */}
        <Script
          id="tawk-to-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
              Tawk_API.onLoad = function(){
                // Hide the widget only on mobile devices
                if (window.innerWidth < 768) {
                  Tawk_API.hideWidget();
                }
              };
              (function(){
                var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                s1.async=true;
                s1.src='https://embed.tawk.to/6888972a4870571920643295/1j1aot0b7';
                s1.charset='UTF-8';
                s1.setAttribute('crossorigin','*');
                s0.parentNode.insertBefore(s1,s0);
              })();
            `,
          }}
        />
      </body>
    </html>
  );
} 