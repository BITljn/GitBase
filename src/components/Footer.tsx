// components/Footer.js
import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase dark:text-gray-300">
              About
            </h3>
            <p className="mt-4 text-base text-gray-500 dark:text-gray-400">
              GitBase is an open-source dynamic website solution without a
              traditional database, built with Next.js and powered by GitHub.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase dark:text-gray-300">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  href="/"
                  className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/resources"
                  className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Resources
                </Link>
              </li>
              <li>
                <Link
                  href="/posts"
                  className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Articles
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase dark:text-gray-300">
              Connect
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a
                  href="https://gitbase.app/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  GitBase
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/qiayue/gitbase"
                  target="_blank"
                  rel="noreferrer"
                  className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com/gefei55"
                  target="_blank"
                  rel="noreferrer"
                  className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-700">
          <p className="text-base text-gray-400 text-center dark:text-gray-500">
            &copy; {new Date().getFullYear()} GitBase. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
