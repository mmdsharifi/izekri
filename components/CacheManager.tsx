import React, { useState, useEffect } from "react";
import { getCacheSize, clearAudioCache } from "../hooks/useAudio";

const CacheManager: React.FC = () => {
  const [cacheSize, setCacheSize] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    updateCacheSize();
  }, []);

  const updateCacheSize = async () => {
    try {
      const size = await getCacheSize();
      setCacheSize(size);
    } catch (error) {
      console.error("Error getting cache size:", error);
    }
  };

  const handleClearCache = async () => {
    if (
      !confirm(
        "آیا مطمئن هستید که می‌خواهید تمام فایل‌های صوتی ذخیره شده را پاک کنید؟"
      )
    ) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await clearAudioCache();
      await updateCacheSize();
      setMessage("فایل‌های صوتی ذخیره شده با موفقیت پاک شدند");
    } catch (error) {
      console.error("Error clearing cache:", error);
      setMessage("خطا در پاک کردن فایل‌های صوتی");
    } finally {
      setLoading(false);
    }
  };

  const formatCacheInfo = () => {
    if (cacheSize === 0) {
      return "هیچ فایل صوتی ذخیره نشده است";
    }
    return `${cacheSize} فایل صوتی ذخیره شده است`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-md mx-auto">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
        مدیریت فایل‌های صوتی
      </h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            وضعیت ذخیره:
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {formatCacheInfo()}
          </span>
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg text-sm ${
              message.includes("خطا")
                ? "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200"
                : "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200"
            }`}
          >
            {message}
          </div>
        )}

        <div className="space-y-2">
          <button
            onClick={updateCacheSize}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            disabled={loading}
          >
            بروزرسانی وضعیت
          </button>

          <button
            onClick={handleClearCache}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || cacheSize === 0}
          >
            {loading ? "در حال پاک کردن..." : "پاک کردن تمام فایل‌ها"}
          </button>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          فایل‌های صوتی برای استفاده آفلاین ذخیره می‌شوند و پس از ۳۰ روز به طور
          خودکار پاک می‌شوند.
        </div>
      </div>
    </div>
  );
};

export default CacheManager;
