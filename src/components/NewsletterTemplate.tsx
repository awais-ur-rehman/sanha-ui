import type { NewsletterData } from '../types/entities'

interface NewsletterTemplateProps {
  newsletterData: NewsletterData
}

const NewsletterTemplate = ({ newsletterData }: NewsletterTemplateProps) => {
  const { mainHeading, sections } = newsletterData
  const month = new Date().toLocaleString('default', { month: 'long' })
  const year = new Date().getFullYear()

  const sectionsHTML = sections.map(section => {
    const linkHTML = section.link
      ? (section.linkStyle === 'button'
        ? `<a href="${section.link}" style="background-color: #2D5B19; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold; font-size: 14px;">${section.linkText || 'Learn More'}</a>`
        : `<a href="${section.link}" style="color: #2D5B19; text-decoration: underline; font-size: 14px;">${section.linkText || 'Learn More'}</a>`)
      : ''

    return `
      <div style="margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px solid #e0e0e0;">
        <div style="font-family: 'Playfair Display', serif; font-size: 16px; font-weight: bold; color: #2D5B19; margin-bottom: 10px;">${section.heading}</div>
        <div style="font-size: 14px; line-height: 1.6; color: #666666; margin-bottom: 10px;">${section.description}</div>
        ${linkHTML ? `<div style="margin-top: 10px;">${linkHTML}</div>` : ''}
      </div>
    `
  }).join('')

  return (
    <div className="newsletter-template-container">
      <style >{`
        .newsletter-template-container {
          font-family: 'Playfair Display', serif;
          line-height: 1.6;
          color: #333333;
          background-color: #f8f9fa;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
        }
        
        .hero-section {
          background: linear-gradient(135deg, #0F1F10 0%, #2D5B19 100%);
          padding: 40px 20px;
          text-align: center;
          color: #ffffff;
        }
        
        .hero-logo {
          max-width: 80px;
          height: auto;
          margin-bottom: 20px;
        }
        
        .newsletter-title {
          font-size: 14px;
          font-weight: normal;
          letter-spacing: 0.1em;
          margin-bottom: 10px;
          text-transform: uppercase;
        }
        
        .special-edition {
          font-family: 'Playfair Display', serif;
          font-size: 16px;
          font-weight: bold;
          margin-top: 20px;
          text-transform: uppercase;
        }
        
        .content-section {
          padding: 30px 20px;
        }
        
        .footer {
          background: linear-gradient(135deg, #0F1F10 0%, #2D5B19 100%);
          padding: 30px 20px;
          color: #ffffff;
          text-align: center;
        }
        
        .footer-text {
          font-size: 12px;
          line-height: 1.5;
          margin-bottom: 20px;
        }
        
        .social-links {
          margin: 20px 0;
        }
        
        .social-link {
          color: #ffffff;
          text-decoration: underline;
          text-decoration-color: #ffffff;
          margin: 0 10px;
          font-size: 14px;
          font-weight: bold;
        }
        
        .company-info {
          font-size: 12px;
          line-height: 1.4;
          margin-bottom: 15px;
        }
        
        .footer-links {
          font-size: 12px;
          color: #ffffff;
          text-decoration: none;
          font-weight: bold;
        }
        
        .footer-link {
          color: #ffffff;
          text-decoration: none;
          font-weight: bold;
        }
        
        @media only screen and (max-width: 480px) {
          .email-container {
            padding: 10px;
          }
          .content-section {
            padding: 20px 10px;
          }
          .hero-section {
            padding: 30px 10px;
          }
          .footer {
            padding: 20px 10px;
          }
        }
      `}</style>
      
      <div className="email-container">
        <div className="hero-section">
          <img 
            src="https://www.sanha.org.pk/wp-content/uploads/2017/12/SANHALogoforWebSite.png" 
            alt="SANHA Logo" 
            className="hero-logo"
          />
          <div className="newsletter-title">SANHA Newsletter - {month} {year}</div>
          {mainHeading && <div className="special-edition">{mainHeading}</div>}
        </div>
        
        <div className="content-section">
          <div style={{ backgroundColor: '#f8f9fa', padding: '20px', marginBottom: '30px', borderRadius: '4px' }}>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: '#333333' }}>
              We're excited to share the latest updates and insights from SANHA. Stay informed about halal certification trends, industry news, and educational opportunities.
            </p>
          </div>
          
          <div dangerouslySetInnerHTML={{ __html: sectionsHTML }} />
          
          <p style={{ textAlign: 'center', marginTop: '30px', fontSize: '14px', color: '#666666' }}>
            Thank you for being part of the SANHA community!<br />
            <strong>Sanha Team</strong>
          </p>
        </div>
        
        <div className="footer">
          <div className="footer-text">
            Thank you for choosing SANHA. We are committed to providing you with the highest quality halal certification services. If you have any questions or need assistance, please don't hesitate to contact us.
          </div>
          
          <div className="social-links flex justify-center">
            <a href="#" className="social-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="#ffffff"/>
              </svg>
            </a>
            <a href="#" className="social-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" fill="#ffffff"/>
              </svg>
            </a>
            <a href="#" className="social-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" fill="#ffffff"/>
              </svg>
            </a>
            <a href="#" className="social-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#ffffff"/>
              </svg>
            </a>
          </div>
          
          <div className="company-info">
            SANHA Pakistan<br />
            Halal Certification Authority<br />
            Lahore, Pakistan
          </div>
          
          <div className="footer-links">
            <a href="#" className="footer-link" style={{ textDecoration: 'none', color: 'white' }}>Contact Us</a> |
            <a href="#" className="footer-link" style={{ textDecoration: 'none', color: 'white' }}>Privacy Policy</a> |
            <a href="#" className="footer-link" style={{ textDecoration: 'none', color: 'white' }}>Manage Preferences</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewsletterTemplate
