import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import matter from "gray-matter";
import { OctokitError } from "@/types/error";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const owner = process.env.GITHUB_OWNER || "";
const repo = process.env.GITHUB_REPO || "";
const articlesJsonPath = "data/json/articles.json";
const mdFolderPath = "data/md";

export async function POST(request: Request) {
  const { title, description, content, slug } = await request.json();

  // Validate slug
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return NextResponse.json({ error: "Invalid slug format" }, { status: 400 });
  }

  const path = `data/md/${slug}.md`;

  try {
    // Check if file already exists
    try {
      await octokit.repos.getContent({
        owner,
        repo,
        path,
      });
      return NextResponse.json(
        { error: "Article with this slug already exists" },
        { status: 400 }
      );
    } catch (error: unknown) {
      // 确保 error 是 Error 类型，并处理特定错误
      if (error instanceof Error && (error as OctokitError).status !== 404) {
        throw error;
      }
    }

    // Create new file
    const fileContent = matter.stringify(content, {
      title,
      description,
      date: new Date().toISOString(),
    });

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: `Create new article: ${title}`,
      content: Buffer.from(fileContent).toString("base64"),
    });

    // Sync articles
    await syncArticles();

    return NextResponse.json({ message: "Article created successfully" });
  } catch (error) {
    console.error("Error creating article:", error);
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 }
    );
  }
}

async function syncArticles() {
  try {
    // Fetch all MD files
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path: mdFolderPath,
    });

    const data = response.data;
    if (!Array.isArray(data)) {
      return;
    }

    const mdFiles = data.filter((file) => file.name.endsWith(".md"));

    const articles = await Promise.all(
      mdFiles.map(async (file) => {
        const artiResp = await octokit.repos.getContent({
          owner,
          repo,
          path: file.path,
        });

        const artiData = artiResp.data;
        if (Array.isArray(artiData) || artiData.type !== "file") {
          return;
        }

        // read single article
        const content = Buffer.from(artiData.content, "base64").toString(
          "utf8"
        );
        const { data: frontMatter } = matter(content);

        // Fetch the last commit for this file
        const commitResp = await octokit.repos.listCommits({
          owner,
          repo,
          path: file.path,
          per_page: 1,
        });
        const commits = commitResp.data;

        if (Array.isArray(commits) && commits.length > 0 && commits[0]) {
          const lastModified =
            commits[0].commit.committer?.date || artiData.sha;

          return {
            title: frontMatter.title,
            description: frontMatter.description,
            date: frontMatter.date,
            lastModified: lastModified,
            path: file.path,
          };
        }
      })
    );

    // Update articles.json
    //const { data: currentFile } = await octokit.repos.getContent({
    const artiJsonResp = await octokit.repos.getContent({
      owner,
      repo,
      path: articlesJsonPath,
    });

    const artiJsonRespData = artiJsonResp.data;
    if (Array.isArray(artiJsonRespData) || artiJsonRespData.type !== "file") {
      return;
    }

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: articlesJsonPath,
      message: "Sync articles",
      content: Buffer.from(JSON.stringify(articles, null, 2)).toString(
        "base64"
      ),
      sha: artiJsonRespData.sha,
    });
  } catch (error) {
    console.error("Error syncing articles:", error);
    throw error;
  }
}
