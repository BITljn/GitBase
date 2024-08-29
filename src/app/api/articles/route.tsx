import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import {
  fetchSingleArticleFromGithub,
  fetchArticleJsonObject,
  fetchAllMarkdownFilesFromGithub,
  updateArticleOnGithub,
} from "@/lib/github";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const owner = process.env.GITHUB_OWNER || "";
const repo = process.env.GITHUB_REPO || "";
const articlesJsonPath = "data/json/articles.json";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sync = searchParams.get("sync");
  const path = searchParams.get("path");

  try {
    if (path) {
      // Fetch single article from github
      const article = await fetchSingleArticleFromGithub(path);
      if (article) {
        return NextResponse.json(article);
      } else {
        return NextResponse.json(
          { error: "Fetch article failed" },
          { status: 404 }
        );
      }
    } else if (sync === "true") {
      await syncArticles();
    }

    const articleJson = await fetchArticleJsonObject();
    return NextResponse.json(articleJson);
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { article } = await request.json();

  try {
    // Update the MD file
    await updateMdFile(article);

    // Sync articles
    await syncArticles();

    return NextResponse.json({ message: "Article updated successfully" });
  } catch (error) {
    console.error("Error updating article:", error);
    return NextResponse.json(
      { error: "Failed to update article" },
      { status: 500 }
    );
  }
}

async function syncArticles() {
  try {
    // 从 md路径下获取所有文章信息
    const mdFiles = await fetchAllMarkdownFilesFromGithub();
    if (!mdFiles) {
      return;
    }

    // 获取每个 article 的简要内容信息
    const articles = await Promise.all(
      mdFiles.map(async (file) => {
        // Fetch single article from github
        const article = await fetchSingleArticleFromGithub(file.path);
        if (!article) {
          return;
        }

        return {
          title: article.title,
          description: article.description,
          date: article.date,
          lastModified: article.lastModified,
          path: article.path,
        };
      })
    );

    // Update articles.json, 要先获取老的 article 的 sha, 用新的 articles.json 内容更新之
    const { data: currentFile } = await octokit.repos.getContent({
      owner,
      repo,
      path: articlesJsonPath,
    });
    if (Array.isArray(currentFile) || currentFile.type !== "file") {
      console.error("Error syncing articles:", "articles.json is not a file");
      return;
    }

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: articlesJsonPath,
      message: "Sync articles",
      content: Buffer.from(JSON.stringify(articles, null, 2)).toString(
        "base64"
      ), // base64 编码
      sha: currentFile.sha,
    });
  } catch (error) {
    console.error("Error syncing articles:", error);
    throw error;
  }
}

async function updateMdFile(article: {
  path: string;
  title: string;
  description: string;
  content: string;
}) {
  try {
    const data = await fetchSingleArticleFromGithub(article.path);
    if (!data) {
      throw new Error("Article not found");
    }

    const updatedArticle = {
      ...data,
      title: article.title,
      description: article.description,
      content: article.content,
      lastModified: new Date().toISOString(),
    };

    await updateArticleOnGithub(updatedArticle);
  } catch (error) {
    console.error("Error updating MD file:", error);
    throw error;
  }
}
