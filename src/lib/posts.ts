import fs from "fs";
import path from "path";
import { marked } from "marked";
import yaml from "js-yaml";
import { articleJsonMeta } from "@/types/resources";
import { FontMatter } from "@/types/resources";

const postsDirectory = path.join(process.cwd(), "data", "md");

export function getSortedPostsData(): articleJsonMeta[] {
  // Get file names under /data/md
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, "");

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    // 正则表达式匹配 YAML Front Matter 部分
    const frontMatterRegex = /^---\s*\n([\s\S]+?)\n---/;
    const match = frontMatterRegex.exec(fileContents);

    //let markdownContent; // 声明 markdownContent 变量
    let metadata: FontMatter = { title: "", description: "", date: "" };
    if (match && match[1]) {
      // 解析 YAML Metadata
      metadata = yaml.load(match[1]) as FontMatter;
      // 获取 Markdown 内容
      //markdownContent = fileContents.slice(match[0].length).trim();
    }
    // Combine the data with the id
    return {
      id,
      title: metadata.title,
      description: metadata.description,
      date: metadata.date,
    } as articleJsonMeta;
  });
  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export async function getPostData(slug: string) {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  // 正则表达式匹配 YAML Front Matter 部分
  const frontMatterRegex = /^---\s*\n([\s\S]+?)\n---/;
  const match = frontMatterRegex.exec(fileContents);

  let metadata: FontMatter = { title: "", description: "", date: "" };
  let markdownContent = fileContents;

  if (match && match[1]) {
    // 解析 YAML Metadata
    metadata = yaml.load(match[1]) as FontMatter;
    // 获取 Markdown 内容
    markdownContent = fileContents.slice(match[0].length).trim();
  }

  // 使用 marked 解析 Markdown 内容
  const contentHtml = marked(markdownContent);

  // Combine the data with the id and contentHtml
  return {
    slug,
    contentHtml,
    title: metadata.title,
    description: metadata.description,
    date: metadata.date,
    // ... any other fields you want to include
  };
}
