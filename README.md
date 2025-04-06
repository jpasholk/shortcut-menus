# iOS Shortcut Menu Generator

![Screenshots of Shortcut Menus in action on devices](/public/og-image.png)

A web-based tool for creating custom menus for iOS Shortcuts. Built with Astro and TailwindCSS.

## 🚀 Features

- Generate custom menu icons with Lucide icons
- Customize icon and background colors
- Toggle between circular and square icons
- Export as VCARD or JSON format
- Live preview of menu appearance
- Dark mode support

## 🛠️ Usage

1. Enter your menu details (title, subtitle, data)
2. Choose an icon from [Lucide Icons](https://lucide.dev/icons)
3. Customize icon colors and shape
4. Toggle between VCARD (simple) and JSON (advanced) output
5. Copy or download the generated code

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command           | Action                                      |
| :--------------- | :------------------------------------------ |
| `npm install`    | Installs dependencies                       |
| `npm run dev`    | Starts local dev server at `localhost:4321` |
| `npm run build`  | Build your production site to `./dist/`     |
| `npm run preview`| Preview your build locally                  |

## 💡 Output Formats

### VCARD Format
```text
BEGIN:VCARD
VERSION:3.0
N:
ORG:
NOTE:
PHOTO;BASE64:
END:VCARD
```

### JSON Format
```json
{
  "menu": {
    "optionOne": {
      "title": "[title]",
      "icon": "[base64]",
      "sub": "[subtitle]",
      "data": "[data]"
    }
  }
}
```

## 🎨 Technologies Used

- [Astro](https://astro.build)
- [TailwindCSS](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)

## Credits

- [BgVault](https://www.bgvault.tech) - for the inspiration and code for the gradient background.
- gluebyte - VCARD info and general Shortcuts wizardry.
- Catify - information about base64 in VCARDS.

## 📝 License

MIT License - feel free to use this code in your own projects!
