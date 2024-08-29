import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const owner = process.env.GITHUB_OWNER || "";
const repo = process.env.GITHUB_REPO || "";
const githubPath = "data/json/resources.json";
const localPath = path.join(process.cwd(), "data", "json", "resources.json");

async function getResourcesFromGitHub() {
  try {
    const response = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: githubPath,
    });

    const data = response.data;

    if (Array.isArray(data)) {
      // 处理目录内容
      //data.forEach(item => {
      //  console.log(`Item name: ${item.name}, Type: ${item.type}`);
      //});
    } else if (data.type === "file") {
      // 处理单个文件
      const content = Buffer.from(data.content, "base64").toString("utf8");
      return JSON.parse(content);
    } else {
      console.log("Unexpected content type");
    }
  } catch (error) {
    console.error("Error fetching resources from GitHub:", error);
    throw error;
  }
}

function getLocalResources() {
  return JSON.parse(fs.readFileSync(localPath, "utf8"));
}

export async function GET(req: Request): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const source = searchParams.get("source");

  if (source === "github") {
    try {
      const resources = await getResourcesFromGitHub();
      return NextResponse.json(resources);
    } catch {
      return NextResponse.json(
        { error: "Failed to fetch resources from GitHub" },
        { status: 500 }
      );
    }
  } else {
    // Default to local file for homepage
    const resources = getLocalResources();
    return NextResponse.json(resources);
  }
}

export async function POST(req: Request): Promise<NextResponse> {
  // 添加类型注解
  const updatedResources = await req.json();

  try {
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path: githubPath,
    });

    const data = response.data;

    if (!Array.isArray(data) && data.type == "file") {
      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: githubPath,
        message: "Update resources",
        content: Buffer.from(
          JSON.stringify(updatedResources, null, 2)
        ).toString("base64"),
        sha: data.sha,
      });
    }

    // Update local file as well
    //fs.writeFileSync(localPath, JSON.stringify(updatedResources, null, 2));

    return NextResponse.json(updatedResources);
  } catch (error) {
    console.error("Error updating resources:", error);
    return NextResponse.json(
      { error: "Failed to update resources" },
      { status: 500 }
    );
  }
}
