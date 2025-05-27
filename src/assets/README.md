# Assets Directory Structure

This directory contains all static assets for the Connecting website.

## Directory Structure

```
assets/
├── images/
│   ├── logos/          # Application and club logos
│   ├── backgrounds/    # Background images
│   ├── icons/         # UI icons
│   └── illustrations/ # Decorative illustrations
└── styles/           # Global styles and theme files
```

## Usage

When importing assets in components, use the following pattern:

```javascript
import logo from "../assets/images/logos/logo.png";
import backgroundImage from "../assets/images/backgrounds/hero-bg.jpg";
```

## Required Assets

Please add the following assets from the Figma design:

### Logos

- compass-logo.png
- club logos for featured clubs

### Backgrounds

- map-background.png
- hero-background.jpg

### Icons

- category icons
- social media icons
- UI action icons

### Illustrations

- student illustrations
- club illustrations
- feature illustrations

Note: When adding new assets, please maintain a consistent naming convention and optimize images for web use.
