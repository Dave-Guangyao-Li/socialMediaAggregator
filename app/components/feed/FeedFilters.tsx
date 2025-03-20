"use client";

import {
  FeedFilters as FeedFiltersType,
  SocialPlatform,
} from "@/app/types/feed";
import { useState } from "react";

interface FeedFiltersProps {
  filters: FeedFiltersType;
  onFiltersChange: (filters: Partial<FeedFiltersType>) => void;
}

export default function FeedFilters({
  filters,
  onFiltersChange,
}: FeedFiltersProps) {
  const [localDates, setLocalDates] = useState({
    startDate: filters.startDate || "",
    endDate: filters.endDate || "",
  });

  const handlePlatformToggle = (platform: SocialPlatform) => {
    const newPlatforms = filters.platforms.includes(platform)
      ? filters.platforms.filter((p) => p !== platform)
      : [platform];

    onFiltersChange({ platforms: newPlatforms });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ searchQuery: event.target.value });
  };

  const handleDateChange = (
    type: "startDate" | "endDate",
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const date = event.target.value;

    // Update the local state first
    setLocalDates((prev) => ({
      ...prev,
      [type]: date,
    }));

    if (type === "startDate" && filters.endDate && date > filters.endDate) {
      // If start date is after end date, clear end date
      onFiltersChange({ [type]: date, endDate: "" });
      setLocalDates((prev) => ({
        ...prev,
        endDate: "",
      }));
    } else if (
      type === "endDate" &&
      filters.startDate &&
      date < filters.startDate
    ) {
      // If end date is before start date, clear start date
      onFiltersChange({ [type]: date, startDate: "" });
      setLocalDates((prev) => ({
        ...prev,
        startDate: "",
      }));
    } else {
      onFiltersChange({ [type]: date });
    }
  };

  const applyDateFilters = () => {
    onFiltersChange({
      startDate: localDates.startDate,
      endDate: localDates.endDate,
    });
  };

  const resetAllFilters = () => {
    setLocalDates({
      startDate: "",
      endDate: "",
    });
    onFiltersChange({
      platforms: ["jsonplaceholder", "mastodon"],
      searchQuery: "",
      startDate: "",
      endDate: "",
    });
  };

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Platform
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handlePlatformToggle("jsonplaceholder")}
            className={`px-4 py-2 rounded-full transition-colors ${
              filters.platforms.includes("jsonplaceholder")
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}>
            JSONPlaceholder
          </button>
          <button
            onClick={() => handlePlatformToggle("mastodon")}
            className={`px-4 py-2 rounded-full transition-colors ${
              filters.platforms.includes("mastodon")
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}>
            Mastodon
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search Posts
        </label>
        <input
          type="text"
          placeholder="Search posts..."
          value={filters.searchQuery}
          onChange={handleSearchChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Date Range
          </label>
          <div className="flex space-x-2">
            <button
              onClick={applyDateFilters}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors">
              Apply Dates
            </button>
            <button
              onClick={() => onFiltersChange({ startDate: "", endDate: "" })}
              className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors">
              Clear Dates
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={localDates.startDate}
              max={localDates.endDate || undefined}
              onChange={(e) => handleDateChange("startDate", e)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">End Date</label>
            <input
              type="date"
              value={localDates.endDate}
              min={localDates.startDate || undefined}
              onChange={(e) => handleDateChange("endDate", e)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {(filters.startDate || filters.endDate) && (
          <div className="mt-2 text-sm text-blue-600">
            Active date filter:{" "}
            {filters.startDate
              ? new Date(filters.startDate).toLocaleDateString()
              : "Any"}
            {" - "}
            {filters.endDate
              ? new Date(filters.endDate).toLocaleDateString()
              : "Any"}
          </div>
        )}
      </div>

      <div className="flex justify-center pt-4 border-t border-gray-200">
        <button
          onClick={resetAllFilters}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
          Reset All Filters
        </button>
      </div>
    </div>
  );
}
