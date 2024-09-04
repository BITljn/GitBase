import { FontMatter } from "types/resources";
import yaml from "js-yaml";
import { marked } from "marked";
import { Octokit } from "@octokit/rest";
import { articlesJsonPath, mdFolderPath } from "lib/constants";
export function getMetaAndHtmlFromArticle(content: string): {
  metadata: FontMatter;
  htmlContent: string;
} {
  // 正则表达式匹配 YAML Front Matter 部分
  const frontMatterRegex = /^---\s*\n([\s\S]+?)\n---/;
  const match = frontMatterRegex.exec(content);

  //let markdownContent; // 声明 markdownContent 变量
  let metadata: FontMatter = { title: "", description: "", date: "" };
  let contentHtml: string = "";
  if (match && match[1]) {
    // 解析 YAML Metadata
    metadata = yaml.load(match[1]) as FontMatter;
    // 获取 Markdown 内容
    const articleContent = content.slice(match[0].length).trim();
    // 转换为 html 结构
    contentHtml = marked(articleContent) as string;
  }

  return { metadata, htmlContent: contentHtml };
}

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});
const owner = process.env.GITHUB_OWNER || "";
const repo = process.env.GITHUB_REPO || "";
export async function fetchSingleArticleFromGithub(path: string): Promise<{
  title: string;
  description: string;
  date: string;
  content: string;
  path: string;
  lastModified: string;
} | null> {
  try {
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path: decodeURIComponent(path),
    });
    const data = response.data;
    if (Array.isArray(data) || data.type !== "file") {
      return null;
    }

    const content = Buffer.from(data.content, "base64").toString("utf8");
    const { metadata, htmlContent } = getMetaAndHtmlFromArticle(content);
    // Fetch the last commit for this file
    const { data: commits } = await octokit.repos.listCommits({
      owner,
      repo,
      path: path,
      per_page: 1,
    });

    if (!Array.isArray(commits) || commits.length === 0) {
      console.error("Error fetching last commits");
      return null;
    }
    const lastModified = commits[0]?.commit.committer?.date || data.sha;

    return {
      ...metadata,
      content: htmlContent,
      path: data.path,
      lastModified: lastModified,
    };
  } catch (error) {
    console.error("Error fetching article:", error);
    return null;
  }
}

export async function updateArticleOnGithub(article: {
  title: string;
  description: string;
  content: string;
  path: string;
  lastModified: string;
}): Promise<string | null> {
  const { title, description, content, path, lastModified } = article;

  // 手动拼接前置信息
  const frontMatter = `---
  title: "${title}"
  description: "${description}"
  lastModified: "${lastModified}"
  date: "${new Date().toISOString()}"
  ---\n`;

  // 将内容和前置信息组合成 Markdown 格式
  const updatedContent = `${frontMatter}${content}`;

  try {
    // 获取当前文件的 SHA 值，以便进行更新
    const { data: currentFile } = await octokit.repos.getContent({
      owner,
      repo,
      path,
    });

    // 确保 currentFile 是一个文件对象
    const fileData = Array.isArray(currentFile) ? currentFile[0] : currentFile;

    // 更新文件内容
    const response = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: `Update article: ${title}`,
      content: Buffer.from(updatedContent).toString("base64"),
      sha: fileData.sha, // 提供当前文件的 SHA 值
    });

    return response.data.content?.sha || null; // 返回更新后的文件 SHA 值
  } catch (error) {
    console.error("Error updating article on GitHub:", error);
    return null;
  }
}

export async function fetchArticleJsonObject() {
  const { data } = await octokit.repos.getContent({
    owner,
    repo,
    path: articlesJsonPath,
  });

  if (Array.isArray(data) || data.type !== "file") {
    return null;
  }

  const content = Buffer.from(data.content, "base64").toString("utf8");
  const articlesObj = JSON.parse(content);
  return articlesObj;
}

// 获取 data/md 下所有文件的 object数组
export async function fetchAllMarkdownFilesFromGithub() {
  // Fetch all MD files
  const { data: files } = await octokit.repos.getContent({
    owner,
    repo,
    path: mdFolderPath,
  });
  if (!Array.isArray(files)) {
    return [];
  }

  const mdFiles = files.filter((file) => file.name.endsWith(".md"));
  return mdFiles;
}
