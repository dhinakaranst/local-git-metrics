
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChartContainer, ChartTooltipContent, ChartTooltip } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { Button } from "@/components/ui/button";
import { Calendar, ChartBar, ChartLine, ChartPie, Filter, Download, RefreshCw, GitCommitHorizontal, Clock, History } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import Layout from "@/components/Layout";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepoLanguages, useTopFiles, useRepoSummary, useCommitActivity } from "@/hooks/useRepoData";
import repoService from "@/services/repoService";
import TimeRangeFilter from "@/components/TimeRangeFilter";
import { useRepoCache } from "@/hooks/useRepoCache";

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [repoPath, setRepoPath] = useState("");
  const [timeRange, setTimeRange] = useState("week");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const queryClient = useQueryClient();
  const { cacheData, saveToCache, clearCache } = useRepoCache();
  
  // Get repo path from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const path = params.get("path");
    if (path) {
      setRepoPath(decodeURIComponent(path));
      analyzePath(decodeURIComponent(path));
    } else {
      // Redirect to home if no path provided
      navigate("/");
    }
  }, [location]);

  // Function to handle time range changes
  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
    // Refresh queries that depend on time range
    queryClient.invalidateQueries({ queryKey: ['repoCommits'] });
  };

  // Mutation for analyzing repo
  const analyzeRepoMutation = useMutation({
    mutationFn: (path: string) => repoService.analyzeRepo(path),
    onSuccess: (response) => {
      toast({
        title: "Repository analyzed successfully",
        description: "View the analytics below",
      });
      setIsInitialLoading(false);
      
      // Refresh all repo data queries
      queryClient.invalidateQueries({ queryKey: ['repoSummary'] });
      queryClient.invalidateQueries({ queryKey: ['repoLanguages'] });
      queryClient.invalidateQueries({ queryKey: ['topFiles'] });
      queryClient.invalidateQueries({ queryKey: ['repoCommits'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error analyzing repository",
        description: "Unable to analyze this repository. Please try again.",
        variant: "destructive",
      });
      setIsInitialLoading(false);
    }
  });

  // Function to trigger repo analysis
  const analyzePath = (path: string) => {
    setIsInitialLoading(true);
    analyzeRepoMutation.mutate(path);
  };

  // Function to handle refresh
  const handleRefresh = () => {
    clearCache();
    analyzePath(repoPath);
  };

  // Mutation for exporting as PDF
  const exportPdfMutation = useMutation({
    mutationFn: () => repoService.exportAsPdf({
      repoPath,
      timeRange,
    }),
    onSuccess: (blob) => {
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `commitmetrics-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "PDF exported successfully",
        description: "The report has been downloaded",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error exporting PDF",
        description: "Could not generate the report. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Data queries
  const { data: languages } = useRepoLanguages();
  const { data: topFiles } = useTopFiles(5);
  const { data: summary } = useRepoSummary(repoPath);
  const { commitActivityData } = useCommitActivity(timeRange);

  // Prepare data for charts
  const languageData = languages ? 
    Object.entries(languages).map(([name, value]) => ({
      name,
      value,
      color: getColorForLanguage(name),
    })) : [];

  const topFilesData = topFiles || [];

  // Chart configurations
  const chartConfig = {
    commits: {
      daily: { label: "Daily Commits" },
      weekly: { label: "Weekly Commits" },
      monthly: { label: "Monthly Commits" },
    },
    languages: {
      JavaScript: { label: "JavaScript", color: "#f7df1e" },
      TypeScript: { label: "TypeScript", color: "#3178c6" },
      CSS: { label: "CSS", color: "#264de4" },
      HTML: { label: "HTML", color: "#e34c26" },
      Java: { label: "Java", color: "#b07219" },
    },
  };

  // Helper function to get color for language
  function getColorForLanguage(language: string): string {
    const colors: Record<string, string> = {
      JavaScript: "#f7df1e",
      TypeScript: "#3178c6",
      CSS: "#264de4",
      HTML: "#e34c26",
      Python: "#3572A5",
      Java: "#b07219",
      CSharp: "#178600",
      PHP: "#4F5D95",
      Ruby: "#701516",
      Go: "#00ADD8",
      Rust: "#dea584",
      Swift: "#ffac45",
      Kotlin: "#F18E33",
      Scala: "#c22d40",
      Objective_C: "#438eff",
      C: "#555555",
      CPlusPlus: "#f34b7d",
    };
    
    return colors[language] || `#${Math.floor(Math.random()*16777215).toString(16)}`;
  }

  // Get cache info
  const lastUpdated = cacheData?.timestamp 
    ? new Date(cacheData.timestamp).toLocaleString() 
    : "Never";

  // Render loading state
  if (isInitialLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Analyzing repository...</h2>
            <p className="text-muted-foreground mb-4">This may take a moment</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-6 px-4">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Repository Dashboard</h1>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <GitCommitHorizontal className="h-4 w-4" />
                <p>{repoPath}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Clock className="h-3 w-3" />
                <p>Last updated: {lastUpdated}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <TimeRangeFilter onFilterChange={handleTimeRangeChange} />
              
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleRefresh}
                className="ml-2"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
              
              <Button 
                size="sm"
                onClick={() => exportPdfMutation.mutate()}
                disabled={exportPdfMutation.isPending}
              >
                <Download className="h-4 w-4 mr-1" />
                {exportPdfMutation.isPending ? "Exporting..." : "Export PDF"}
              </Button>
            </div>
          </div>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg p-4 border h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Commit Activity</h3>
                <ChartLine className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="h-80">
                <ChartContainer
                  config={chartConfig.commits}
                  className="h-full w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={commitActivityData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area 
                        type="monotone" 
                        dataKey="commits" 
                        stroke="#8884d8" 
                        fillOpacity={1} 
                        fill="url(#colorCommits)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-card rounded-lg p-4 border h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Languages Used</h3>
                <ChartPie className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="h-80">
                <ChartContainer
                  config={chartConfig.languages}
                  className="h-full w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={languageData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {languageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent nameKey="name" labelKey="value"/>} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="bg-card rounded-lg p-4 border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Most Modified Files</h3>
              <ChartBar className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topFilesData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="filename" width={150} />
                  <ChartTooltip />
                  <Bar dataKey="changes" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {summary && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card rounded-lg p-4 border">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Commits</h3>
              <p className="text-2xl font-bold">{summary.totalCommits || 0}</p>
            </div>
            <div className="bg-card rounded-lg p-4 border">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Languages</h3>
              <p className="text-2xl font-bold">{languages ? Object.keys(languages).length : 0}</p>
            </div>
            <div className="bg-card rounded-lg p-4 border">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Contributors</h3>
              <p className="text-2xl font-bold">{summary.authors?.length || 0}</p>
            </div>
            <div className="bg-card rounded-lg p-4 border">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Files Changed</h3>
              <p className="text-2xl font-bold">{topFiles?.length || 0}</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
