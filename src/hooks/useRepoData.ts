
import { useQuery } from '@tanstack/react-query';
import repoService from '@/services/repoService';

// Hook for getting summary data
export const useRepoSummary = (repoId?: string) => {
  return useQuery({
    queryKey: ['repoSummary', repoId],
    queryFn: () => repoService.getRepoSummary(repoId),
    enabled: !!repoId, // Only run if repoId is provided
  });
};

// Hook for getting commits
export const useRepoCommits = (startDate?: string, endDate?: string, author?: string) => {
  return useQuery({
    queryKey: ['repoCommits', startDate, endDate, author],
    queryFn: () => repoService.getCommits(startDate, endDate, author),
    enabled: !!(startDate || endDate || author), // Only run if at least one param is provided
  });
};

// Hook for getting languages
export const useRepoLanguages = () => {
  return useQuery({
    queryKey: ['repoLanguages'],
    queryFn: () => repoService.getLanguages(),
  });
};

// Hook for getting top files
export const useTopFiles = (limit?: number) => {
  return useQuery({
    queryKey: ['topFiles', limit],
    queryFn: () => repoService.getTopFiles(limit),
  });
};
