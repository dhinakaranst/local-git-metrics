
import { useQuery } from '@tanstack/react-query';
import repoService from '@/services/repoService';
import { useRepoCache } from './useRepoCache';

// Hook for getting summary data
export const useRepoSummary = (repoPath?: string) => {
  const { getCacheForRepo } = useRepoCache();
  
  return useQuery({
    queryKey: ['repoSummary', repoPath],
    queryFn: () => repoService.getRepoSummary(),
    enabled: !!repoPath,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

// Hook for getting commits
export const useRepoCommits = (timeRange?: string, author?: string) => {
  let startDate: string | undefined;
  let endDate: string | undefined;
  
  // Calculate date range based on timeRange
  if (timeRange) {
    const now = new Date();
    endDate = now.toISOString().split('T')[0];
    
    if (timeRange === 'week') {
      const lastWeek = new Date();
      lastWeek.setDate(now.getDate() - 7);
      startDate = lastWeek.toISOString().split('T')[0];
    } else if (timeRange === 'month') {
      const lastMonth = new Date();
      lastMonth.setMonth(now.getMonth() - 1);
      startDate = lastMonth.toISOString().split('T')[0];
    }
  }
  
  return useQuery({
    queryKey: ['repoCommits', timeRange, author],
    queryFn: () => repoService.getCommits(startDate, endDate, author),
    enabled: !!timeRange,
  });
};

// Hook for getting languages
export const useRepoLanguages = () => {
  return useQuery({
    queryKey: ['repoLanguages'],
    queryFn: () => repoService.getLanguages(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

// Hook for getting top files
export const useTopFiles = (limit: number = 5) => {
  return useQuery({
    queryKey: ['topFiles', limit],
    queryFn: () => repoService.getTopFiles(limit),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

// Hook for getting commit activity data formatted for charts
export const useCommitActivity = (timeRange: string = 'week') => {
  const { data: commitData } = useRepoCommits(timeRange);
  
  // Process the data for the activity chart
  const commitActivityData = commitData?.commits
    ? Object.entries(commitData.commits.reduce((acc: Record<string, number>, commit) => {
        const date = commit.date.split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {}))
        .map(([date, count]) => ({
          date,
          commits: count
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : [];
    
  return { commitActivityData };
};
