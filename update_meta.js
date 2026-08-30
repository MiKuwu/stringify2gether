const fs = require("fs");
let content = fs.readFileSync("src/app/layout.tsx", "utf-8");

const oldMeta = `    icons: settings?.faviconUrl ? [
      { rel: "icon", url: settings.faviconUrl }
    ] : undefined
  }`;

const newMeta = `    icons: settings?.faviconUrl ? [
      { rel: "icon", url: settings.faviconUrl }
    ] : undefined,
    verification: {
      google: "lkP2u5ftg-q6JhCbmCKM2oATb1jNZ5d6zyKtwVvEgXQ"
    }
  }`;

content = content.replace(oldMeta, newMeta);
fs.writeFileSync("src/app/layout.tsx", content);
console.log("Updated metadata in layout.tsx");