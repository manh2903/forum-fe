import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach((file) => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith(".tsx") || dirFile.endsWith(".ts")) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
};

const map = {
  // backgrounds
  "#0f172a": "#f8fafc",
  "#1e293b": "#ffffff",
  "#1a2740": "#f1f5f9",
  // borders
  "#334155": "#e2e8f0",
  "#475569": "#cbd5e1",
  "#2d3f5c": "#cbd5e1",
  // texts
  "#f1f5f9": "#0f172a",
  "#94a3b8": "#475569",
  "#64748b": "#64748b", // Keep somewhat medium
  // alphas/transparents -> generally keep the underlying color but replace standard hexes
  "#1e2a3a": "#f1f5f9",
  "#1e2d3d": "#e2e8f0",
};

const files = walkSync(path.join(__dirname, "src"));
files.forEach((f) => {
  let content = fs.readFileSync(f, "utf8");
  let originalContent = content;

  Object.entries(map).forEach(([darkHex, lightHex]) => {
    const regex = new RegExp(darkHex, "gi");
    content = content.replace(regex, lightHex);
  });

  if (content !== originalContent) {
    fs.writeFileSync(f, content);
    console.log("Updated", path.basename(f));
  }
});

// Also update index.css
const cssPath = path.join(__dirname, "src", "index.css");
if (fs.existsSync(cssPath)) {
  let css = fs.readFileSync(cssPath, "utf8");
  css = css.replace(/#0f172a/gi, "#f8fafc");
  css = css.replace(/color:\s*#f1f5f9/gi, "color: #0f172a");
  fs.writeFileSync(cssPath, css);
}

console.log("Theme fixed successfully.");
