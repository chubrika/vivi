import Link from 'next/link';
import Image from 'next/image';
import { FaCcVisa, FaCcMastercard } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-[rgb(2_132_199/0.06)] border-t-[1px] border-[#0284c73b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 py-6 md:py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Wrapper for first two sections to display side by side on mobile */}
          <div className="grid grid-cols-2 gap-4 md:contents">
            {/* About Us */}
            <div className="text-left">
              <h3 className="text-[12px] font-semibold mb-3 md:mb-4 text-[#0284c7]">ჩვენს შესახებ</h3>
              <ul className="space-y-2">
                <li className="leading-[16px]">
                  <Link href="/about" className="text-[12px] text-[#696969] hover:text-[#0284c7] transition-colors">
                    ჩვენი ისტორია
                  </Link>
                </li>
                <li className="leading-[16px]">
                  <Link href="/team" className="text-[12px] text-[#696969] hover:text-[#0284c7] transition-colors">
                    ჩვენი გუნდი
                  </Link>
                </li>
                <li className="leading-[16px]">
                  <Link href="/careers" className="text-[12px] text-[#696969] hover:text-[#0284c7] transition-colors">
                    კარიერა
                  </Link>
                </li>
                <li className="leading-[16px]">
                  <Link href="/blog" className="text-[12px] text-[#696969] hover:text-[#0284c7] transition-colors">
                    ბლოგი
                  </Link>
                </li>
              </ul>
            </div>

            {/* Terms and Conditions */}
            <div className="text-left">
              <h3 className="text-[12px] font-semibold mb-3 md:mb-4 text-[#0284c7] ">წესები და პირობები</h3>
              <ul className="space-y-2">
                <li className="leading-[16px]">
                  <Link href="/terms" className="text-[12px] text-[#696969] hover:text-[#0284c7] transition-colors">
                    მომსახურების პირობები
                  </Link>
                </li>
                <li className="leading-[16px]">
                  <Link href="/privacy" className="text-[12px] text-[#696969] hover:text-[#0284c7] transition-colors">
                    კონფიდენციალურობის პოლიტიკა
                  </Link>
                </li>
                <li className="leading-[16px]">
                  <Link href="/shipping" className="text-[12px] text-[#696969] hover:text-[#0284c7] transition-colors">
                    მიწოდების პოლიტიკა
                  </Link>
                </li>
                <li className="leading-[16px]">
                  <Link href="/returns" className="text-[12px] text-[#696969] hover:text-[#0284c7] transition-colors">
                    კონფიდენციალურობა
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Wrapper for last two sections to display side by side on mobile */}
          <div className="grid grid-cols-2 gap-4 md:contents">
            {/* Contact Us */}
            <div className="text-left">
              <h3 className="text-[12px] font-semibold mb-3 md:mb-4 text-[#0284c7]">დაგვიკავშირდით</h3>
              <ul className="space-y-2">
                <li className="flex items-center justify-start leading-[1px]">
                  <svg className="h-4 w-4 md:h-5 md:w-5 mr-2 mt-0.5 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-[12px] text-[#696969] hover:text-[#0284c7] transition-colors">პეკინის 24, თბილისი</span>
                </li>
                <li className="flex items-center justify-start leading-[1px]">
                  <svg className="h-4 w-4 md:h-5 md:w-5 mr-2 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href="tel:+995123456789" className="text-[12px] text-[#696969] hover:text-[#0284c7] transition-colors">
                    +995 123 456 789
                  </a>
                </li>
                <li className="flex items-center justify-start leading-[1px]">
                  <svg className="h-4 w-4 md:h-5 md:w-5 mr-2 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:info@vivishop.com" className="text-[12px] text-[#696969] hover:text-[#0284c7] transition-colors">
                    vivishopinfo2@gmail.com
                  </a>
                </li>
                
                {/* Social Media Icons */}
                <li className="pt-3 md:pt-4 leading-[1px]">
                  <div className="flex space-x-4 justify-start">
                    <a href="https://www.facebook.com/portalvivi.ge" target="_blank" rel="noopener noreferrer" className="text-[#696969] hover:text-[#0284c7] transition-colors">
                      <svg className="h-5 w-5 md:h-6 md:w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                      </svg>
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-[#696969] hover:text-[#0284c7] transition-colors">
                      <svg className="h-5 w-5 md:h-6 md:w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                      </svg>
                    </a>
                    <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-[#696969] hover:text-[#0284c7] transition-colors">
                      <svg className="h-5 w-5 md:h-6 md:w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
                      </svg>
                    </a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-[#696969] hover:text-[#0284c7] transition-colors">
                      <svg className="h-5 w-5 md:h-6 md:w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </a>
                  </div>
                </li>
              </ul>
            </div>
            {/* Payment Methods */}
            <div className="text-left">
              <h3 className="text-[12px] font-semibold mb-3 md:mb-4 text-[#0284c7] ">გადახდის მეთოდები</h3>
              <div className="flex flex-wrap gap-4 justify-start items-center">
                <FaCcVisa className="text-[50px] text-[#1434CB]" />
                <FaCcMastercard className="text-[50px] text-[#EB001B]" />
              </div>
            </div>

          </div>
        </div>

      </div>
      
      <div className="border-t border-white pt-6 md:pt-6 mb-6 md:mb-6 pt-6 md:pt-6 text-center text-gray-300 text-xs md:text-sm">
          <p className="text-[#696969]">&copy; {new Date().getFullYear()} Vivi Shop. ყველა უფლება დაცულია.</p>
        </div>
    </footer>
  );
};

export default Footer; 