# O'Donovan Family Tree

An interactive family tree visualization built with Next.js 14, TypeScript, and Tailwind CSS. This application renders a beautiful, responsive family tree from JSON data with features like zoom, pan, and interactive highlighting of family connections.

![Family Tree Preview](https://via.placeholder.com/800x400/22c55e/ffffff?text=O%27Donovan+Family+Tree)

## Features

-   📊 **Data-driven rendering** - Reads from a single JSON file
-   🎨 **Beautiful styling** - Rounded cards with generation-based colors
-   👫 **Couple handling** - Joint nodes for married couples
-   🔍 **Interactive exploration** - Click to highlight ancestors/descendants
-   📱 **Responsive design** - Works on mobile, tablet, and desktop
-   🌙 **Dark mode support** - Automatic dark/light theme switching
-   🔄 **Zoom & Pan** - Mouse wheel zoom and drag to navigate
-   ⚡ **Hot reload** - Changes to family.json automatically update in dev mode

## Getting Started

### Prerequisites

-   Node.js 18+
-   npm, yarn, or pnpm

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd odonovan-family-tree
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Customizing Your Family Data

### Editing the Family Tree

The family tree data is stored in `/data/family.json`. To customize it for your own family:

1. Edit the JSON file following this structure:

```json
{
	"id": "root",
	"name": "Your Ancestor Name",
	"spouse": "Spouse Name (optional)",
	"children": [
		{
			"name": "Child Name",
			"spouse": "Child's Spouse (optional)",
			"children": [
				// Grandchildren...
			]
		}
	]
}
```

### Data Model

Each person in the tree has these properties:

-   `id` (optional): Unique identifier - auto-generated from name if not provided
-   `name` (required): Person's full name
-   `spouse` (optional): Spouse's name - will be displayed as "Person and Spouse"
-   `children` (optional): Array of child objects following the same structure

### Example Structure

```json
{
	"name": "John Smith",
	"spouse": "Jane Doe",
	"children": [
		{
			"name": "Alice Smith",
			"children": [{ "name": "Bob Smith Jr." }, { "name": "Carol Smith" }]
		},
		{ "name": "David Smith" }
	]
}
```

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with fonts and metadata
│   │   ├── page.tsx            # Main page that loads and displays the tree
│   │   └── globals.css         # Global styles and CSS variables
│   ├── components/
│   │   ├── FamilyTree.tsx      # Main tree component with zoom/pan
│   │   ├── TreeNode.tsx        # Individual person/couple node
│   │   └── TreeConnectors.tsx  # SVG lines connecting family members
│   └── lib/
│       ├── types.ts            # TypeScript type definitions
│       └── treeUtils.ts        # Layout algorithms and utilities
├── data/
│   └── family.json             # Your family tree data
└── public/                     # Static assets
```

## Technology Stack

-   **Framework**: Next.js 14 with App Router
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS v4
-   **Fonts**: Geist Sans & Geist Mono
-   **Utilities**: clsx for conditional classes

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Deploy with one click

### Deploy to Other Platforms

1. Build the application:

```bash
npm run build
```

2. The built files will be in the `.next` folder
3. Deploy using your preferred hosting platform

## Customization

### Colors and Styling

The tree uses generation-based colors defined in `TreeNode.tsx`. To customize:

1. Edit the `getNodeColors` function in `src/components/TreeNode.tsx`
2. Modify the Tailwind classes for different color schemes
3. Update `src/app/globals.css` for global styling changes

### Layout and Positioning

Tree layout is controlled by `src/lib/treeUtils.ts`:

-   `calculateTreeDimensions`: Adjusts spacing and sizing
-   `positionTreeNodes`: Controls node positioning algorithm
-   Modify these functions to change the tree layout

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit: `git commit -am 'Add some feature'`
5. Push: `git push origin feature-name`
6. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions:

1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Include your `family.json` structure if relevant

---

Built with ❤️ using Next.js and Tailwind CSS
