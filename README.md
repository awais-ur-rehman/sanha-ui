# Sanha Admin Dashboard

A modern, responsive admin dashboard built with React, TypeScript, Vite, and Tailwind CSS for managing the Sanha library system.

## Features

- 🎨 **Modern UI**: Clean, professional design with Tailwind CSS
- 📱 **Responsive**: Works perfectly on desktop, tablet, and mobile devices
- ⚡ **Fast**: Built with Vite for lightning-fast development and builds
- 🔧 **TypeScript**: Full type safety and better developer experience
- 🎯 **Modular**: Well-organized component structure
- 📊 **Dashboard**: Overview with statistics and recent activities
- 👥 **User Management**: Manage users, roles, and permissions
- 📚 **Book Management**: Library book inventory and availability
- 📰 **News System**: Publish and manage news articles
- 🔬 **Research Portal**: Manage research papers and publications
- 📦 **Module Management**: System modules and features
- 🔐 **Role Management**: User roles and permissions

## Tech Stack

- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS processing
- **ESLint** - Code linting

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sanha-backend/Sanha-Admin
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable components
│   └── Sidebar.tsx     # Main navigation sidebar
├── pages/              # Page components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Users.tsx       # User management
│   ├── Books.tsx       # Book management
│   ├── News.tsx        # News management
│   ├── Research.tsx    # Research management
│   ├── Modules.tsx     # Module management
│   └── Roles.tsx       # Role management
├── App.tsx             # Main app component
├── index.css           # Global styles and Tailwind
└── main.tsx            # App entry point
```

## Design System

The dashboard uses a consistent design system with:

- **Colors**: Primary grays and accent colors
- **Typography**: Inter font family
- **Components**: Reusable button, card, and table styles
- **Spacing**: Consistent spacing using Tailwind's spacing scale
- **Icons**: Emoji icons for simplicity (can be replaced with SVG icons)

## Customization

### Colors
Edit `tailwind.config.js` to customize the color palette:

```javascript
colors: {
  primary: {
    // Your custom primary colors
  },
  gray: {
    // Your custom gray colors
  }
}
```

### Components
All components are built with Tailwind CSS classes and can be easily customized by modifying the classes or adding new utility classes.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team.
