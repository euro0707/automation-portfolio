#!/usr/bin/env node
/**
 * Portfolio Site Builder
 *
 * Scans the repository for portfolio.json files, aggregates them into
 * site/data.json, and copies referenced images into site/img/<slug>/.
 *
 * No external dependencies — Node.js built-ins only.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SITE_DIR = path.join(ROOT, "site");
const SITE_IMG_DIR = path.join(SITE_DIR, "img");
const OUTPUT_JSON = path.join(SITE_DIR, "data.json");

const IGNORE_DIRS = new Set([".git", "node_modules", "site", "scripts", ".netlify"]);

function findPortfolioFiles(dir, found = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      findPortfolioFiles(path.join(dir, entry.name), found);
    } else if (entry.name === "portfolio.json") {
      found.push(path.join(dir, entry.name));
    }
  }
  return found;
}

function validate(project, filepath) {
  const required = ["slug", "title", "category", "tool", "problem", "solution", "result", "order"];
  for (const key of required) {
    if (project[key] === undefined || project[key] === null || project[key] === "") {
      throw new Error(`[${filepath}] missing required field: ${key}`);
    }
  }
  if (!Array.isArray(project.tags)) project.tags = [];
  if (!Array.isArray(project.metrics)) project.metrics = [];
  if (!Array.isArray(project.images)) project.images = [];
}

function copyImages(project, sourceDir) {
  const destDir = path.join(SITE_IMG_DIR, project.slug);
  if (project.images.length === 0) return;

  fs.mkdirSync(destDir, { recursive: true });

  for (const image of project.images) {
    const srcPath = path.join(sourceDir, image.src);
    if (!fs.existsSync(srcPath)) {
      throw new Error(`[${project.slug}] image not found: ${srcPath}`);
    }
    const filename = path.basename(image.src);
    const destPath = path.join(destDir, filename);
    fs.copyFileSync(srcPath, destPath);

    // Rewrite src to the published path
    image.src = `img/${project.slug}/${filename}`;
  }
}

function main() {
  console.log(`[build] scanning ${ROOT}`);

  // Ensure site directory exists
  fs.mkdirSync(SITE_DIR, { recursive: true });

  // Clean old generated artifacts
  if (fs.existsSync(SITE_IMG_DIR)) {
    fs.rmSync(SITE_IMG_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(SITE_IMG_DIR, { recursive: true });

  const files = findPortfolioFiles(ROOT);
  console.log(`[build] found ${files.length} portfolio.json files`);

  const projects = [];
  for (const file of files) {
    const raw = fs.readFileSync(file, "utf8");
    let project;
    try {
      project = JSON.parse(raw);
    } catch (err) {
      throw new Error(`[${file}] invalid JSON: ${err.message}`);
    }
    validate(project, file);
    copyImages(project, path.dirname(file));
    projects.push(project);
    console.log(`  ✓ ${project.slug} (${project.category})`);
  }

  projects.sort((a, b) => a.order - b.order);

  const output = {
    generatedAt: new Date().toISOString(),
    count: projects.length,
    projects,
  };

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(output, null, 2), "utf8");
  console.log(`[build] wrote ${OUTPUT_JSON}`);
  console.log(`[build] done — ${projects.length} projects`);
}

try {
  main();
} catch (err) {
  console.error(`[build] FAILED: ${err.message}`);
  process.exit(1);
}
