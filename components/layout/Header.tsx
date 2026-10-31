"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCurrentUser, useLogout } from "@/hooks/useAuth";

export function Header() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/documents?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : "U";
  const userName = user?.email ? user.email.split("@")[0] : "Student";

  return (
    <header className="navbar">
      {/* 1. Logo left */}
      <Link href="/dashboard" className="navbar__logo logo">
        <span>Uni</span>
        <span className="navbar__logo-accent">Vault</span>
      </Link>

      {/* 2. Search bar center (flex 1) */}
      <form onSubmit={handleSearchSubmit} className="navbar__search">
        <div className="search-bar">
          <span className="search-bar__icon">
            <svg
              width="14"
              height="14"
              style={{ width: "14px", height: "14px", flexShrink: 0 }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents…"
            className="search-bar__input"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="search-bar__clear"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </form>

      {/* 3. Avatar right & Profile dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="avatar"
          aria-label="User profile menu"
          aria-expanded={dropdownOpen}
        >
          {userInitial}
        </button>

        {dropdownOpen && (
          <div className="dropdown">
            <div className="dropdown__menu">
              {/* User header at top: 38px avatar, name 13px bold primary, email 11px secondary */}
              <div className="dropdown__header">
                <div className="avatar avatar--lg">{userInitial}</div>
                <div className="dropdown__user-info">
                  <span className="dropdown__user-name">{userName}</span>
                  <span className="dropdown__user-email">
                    {user?.email ?? "student@university.edu"}
                  </span>
                </div>
              </div>

              {/* Menu items: 13px --color-text-muted, icon 16px secondary, padding 9px 16px */}
              <Link
                href="/dashboard"
                onClick={() => setDropdownOpen(false)}
                className="dropdown__item"
              >
                <span className="dropdown__item-icon">
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                </span>
                <span>Dashboard</span>
              </Link>

              <Link
                href="/documents"
                onClick={() => setDropdownOpen(false)}
                className="dropdown__item"
              >
                <span className="dropdown__item-icon">
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </span>
                <span>Library</span>
              </Link>

              <Link
                href="/my-uploads"
                onClick={() => setDropdownOpen(false)}
                className="dropdown__item"
              >
                <span className="dropdown__item-icon">
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </span>
                <span>My uploads</span>
              </Link>

              <Link
                href="/favourites"
                onClick={() => setDropdownOpen(false)}
                className="dropdown__item"
              >
                <span className="dropdown__item-icon">
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </span>
                <span>Favourites</span>
              </Link>

              <Link
                href="/upload"
                onClick={() => setDropdownOpen(false)}
                className="dropdown__item"
              >
                <span className="dropdown__item-icon">
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                </span>
                <span>Upload</span>
              </Link>

              {/* Dividers: 0.5px solid --color-border */}
              <hr className="dropdown__divider" />

              {/* Logout item: --color-danger text and icon */}
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  logout.mutate();
                }}
                className="dropdown__item dropdown__item--danger"
              >
                <span className="dropdown__item-icon">
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </span>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
