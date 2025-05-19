
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ChartContainer, ChartTooltipContent, ChartTooltip } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { Button } from "@/components/ui/button";
import { Calendar, ChartBar, ChartLine, ChartPie, Filter } from "lucide-react";

// Mock data (will be replaced with real Git data)
const commitData = [
  { date: "2025-05-01", commits: 4 },
  { date: "2025-05-02", commits: 2 },
  { date: "2025-05-03", commits: 6 },
  { date: "2025-05-04", commits: 8 },
  { date: "2025-05-05", commits: 5 },
  { date: "2025-05-06", commits: 10 },
  { date: "2025-05-07", commits: 3 },
  { date: "2025-05-08", commits: 7 },
  { date: "2025-05-09", commits: 9 },
  { date: "2025-05-10", commits: 4 },
  { date: "2025-05-11", commits: 6 },
  { date: "2025-05-12", commits: 11 },
  { date: "2025-05-13", commits: 8 },
  { date: "2025-05-14", commits: 7 },
];

const languageData = [
  { name: "JavaScript", value: 45, color: "#f7df1e" },
  { name: "TypeScript", value: 30, color: "#3178c6" },
  { name: "CSS", value: 15, color: "#264de4" },
  { name: "HTML", value: 10, color: "#e34c26" },
];

const topFilesData = [
  { name: "src/components/App.tsx", changes: 25 },
  { name: "src/utils/helpers.ts", changes: 20 },
  { name: "src/styles/main.css", changes: 18 },
  { name: "src/pages/Home.tsx", changes: 15 },
  { name: "src/api/client.ts", changes: 12 },
];

const Dashboard = () => {
  const location = useLocation();
  const [repoPath, setRepoPath] = useState("");
  const [timeRange, setTimeRange] = useState("week");
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const path = params.get("path");
    if (path) {
      setRepoPath(decodeURIComponent(path));
      
      // Simulate loading data from backend
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    }
  }, [location]);

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
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Analyzing repository...</h2>
          <p className="text-muted-foreground mb-4">This may take a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto py-4 px-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">CommitMetrics</h1>
            <p className="text-sm text-muted-foreground">{repoPath}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </Button>
            <Button size="sm" variant="outline">
              <Calendar className="h-4 w-4 mr-1" />
              {timeRange === "week" ? "Last Week" : timeRange === "month" ? "Last Month" : "All Time"}
            </Button>
            <Button size="sm">Export PDF</Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto py-6 px-4">
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
                      data={commitData}
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
                  <YAxis type="category" dataKey="name" width={150} />
                  <ChartTooltip />
                  <Bar dataKey="changes" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="border-t mt-auto">
        <div className="container mx-auto py-4 text-center text-muted-foreground">
          <p>CommitMetrics &copy; 2025 - A self-hostable Git analytics tool</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
