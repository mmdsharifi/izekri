import React, { useState, useMemo } from "react";
import type { Category, Dhikr } from "../types";

interface AdhkarListScreenProps {
  categories: Category[];
  allDhikr: Dhikr[];
}

const AdhkarListScreen: React.FC<AdhkarListScreenProps> = ({
  categories,
  allDhikr,
}) => {
  const [search, setSearch] = useState("");

  // Filtered adhkar by search
  const filteredByCategory = useMemo(() => {
    const lower = search.trim().toLowerCase();
    if (!lower)
      return categories.map((cat) => ({
        ...cat,
        dhikrs: allDhikr.filter((d) => cat.dhikrIds.includes(d.id)),
      }));
    return categories
      .map((cat) => ({
        ...cat,
        dhikrs: allDhikr.filter(
          (d) =>
            cat.dhikrIds.includes(d.id) &&
            (d.arabic.includes(search) ||
              d.translation.toLowerCase().includes(lower))
        ),
      }))
      .filter((cat) => cat.dhikrs.length > 0);
  }, [search, categories, allDhikr]);

  return (
    <div className="p-4 pb-20 max-w-2xl mx-auto w-full">
      <div className="mb-4">
        <input
          type="text"
          className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-right focus:outline-none focus:ring-2 focus:ring-teal-400"
          placeholder="جستجو در متن یا ترجمه..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          dir="rtl"
        />
      </div>
      {filteredByCategory.length === 0 && (
        <div className="text-center text-gray-400 mt-12">ذکری یافت نشد.</div>
      )}
      {filteredByCategory.map((cat) => (
        <div key={cat.id} className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-teal-700 dark:text-teal-300">
              {cat.title}
            </span>
            {cat.icon && <cat.icon className="w-5 h-5 text-teal-400" />}
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3 divide-y divide-gray-200 dark:divide-gray-700">
            {cat.dhikrs.map((dhikr: Dhikr) => (
              <div key={dhikr.id} className="py-3 px-2 flex flex-col gap-1">
                <span
                  className="font-serif text-lg text-gray-800 dark:text-gray-100"
                  lang="ar"
                  dir="rtl"
                >
                  {dhikr.arabic}
                </span>
                <span
                  className="text-sm text-gray-600 dark:text-gray-300"
                  dir="rtl"
                >
                  {dhikr.translation}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdhkarListScreen;
