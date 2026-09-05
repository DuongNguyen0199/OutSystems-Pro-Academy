import React from 'react';

interface CourseCardSkeletonProps {
  theme?: 'light' | 'dark';
}

export default function CourseCardSkeleton({ theme = 'light' }: CourseCardSkeletonProps) {
  const isDark = theme === 'dark';

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all flex flex-col animate-pulse ${
        isDark
          ? 'bg-slate-900/90 border-slate-800 shadow-md'
          : 'bg-white border-slate-200 shadow-xs'
      }`}
    >
      {/* Upper Content Frame */}
      <div className="p-5 md:p-6 flex flex-col md:flex-row gap-5 md:gap-6">
        
        {/* Thumbnail Cover Photo Skeleton */}
        <div
          className={`w-full md:w-48 h-48 md:h-36 shrink-0 rounded-xl relative overflow-hidden ${
            isDark ? 'bg-slate-800' : 'bg-slate-100'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.8s_infinite]" />
        </div>

        {/* Text Metadata Skeleton */}
        <div className="flex-1 flex flex-col justify-between space-y-4">
          <div>
            {/* Title & Price Row Skeleton */}
            <div className="flex items-start justify-between gap-4">
              <div
                className={`h-6 rounded-lg w-2/3 ${
                  isDark ? 'bg-slate-800' : 'bg-slate-200'
                }`}
              />
              <div
                className={`h-7 rounded-lg w-16 hidden md:block ${
                  isDark ? 'bg-slate-800' : 'bg-slate-200'
                }`}
              />
            </div>

            {/* Badges / Tags Skeletons */}
            <div className="flex flex-wrap gap-2 mt-3 items-center">
              <div
                className={`h-5 w-14 rounded-md ${
                  isDark ? 'bg-purple-900/40 border border-purple-800/30' : 'bg-purple-50 border border-purple-100'
                }`}
              />
              <div
                className={`h-5 w-20 rounded-md ${
                  isDark ? 'bg-blue-900/40 border border-blue-800/30' : 'bg-blue-50 border border-blue-100'
                }`}
              />
              <div
                className={`h-5 w-24 rounded-md ${
                  isDark ? 'bg-emerald-900/40 border border-emerald-800/30' : 'bg-emerald-50 border border-emerald-100'
                }`}
              />
            </div>

            {/* Description Lines Skeletons */}
            <div className="space-y-2 mt-4">
              <div
                className={`h-4 rounded w-full ${
                  isDark ? 'bg-slate-800/70' : 'bg-slate-100'
                }`}
              />
              <div
                className={`h-4 rounded w-4/5 ${
                  isDark ? 'bg-slate-800/70' : 'bg-slate-100'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Buttons Deck Skeleton */}
      <div
        className={`px-5 md:px-6 pb-5 md:pb-6 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t pt-4 ${
          isDark ? 'border-slate-800/60' : 'border-slate-100'
        }`}
      >
        <div
          className={`h-10 rounded-xl ${
            isDark ? 'bg-slate-800/80' : 'bg-slate-100'
          }`}
        />
        <div
          className={`h-10 rounded-xl ${
            isDark ? 'bg-blue-600/30' : 'bg-blue-100/70'
          }`}
        />
        <div
          className={`h-10 rounded-xl ${
            isDark ? 'bg-slate-800/80' : 'bg-slate-100'
          }`}
        />
      </div>
    </div>
  );
}
