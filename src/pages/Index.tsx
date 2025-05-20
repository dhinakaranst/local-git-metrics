
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import Layout from "@/components/Layout";
import { useMutation } from "@tanstack/react-query";
import repoService from "@/services/repoService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Clock } from "lucide-react";

const Index = () => {
  const [repoPath, setRepoPath] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const navigate = useNavigate();

  // Mutation for analyzing repository
  const analyzeRepoMutation = useMutation({
    mutationFn: (path: string) => {
      setIsConnecting(true);
      return repoService.analyzeRepo(path);
    },
    onSuccess: (data) => {
      setIsConnecting(false);
      toast({
        title: "Success",
        description: "Repository analyzed successfully",
      });
      navigate(`/dashboard?path=${encodeURIComponent(repoPath)}`);
    },
    onError: (error: Error) => {
      setIsConnecting(false);
      console.error("Repository analysis failed:", error);
      toast({
        title: "Error",
        description: `Repository analysis failed: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoPath) {
      toast({
        title: "Error",
        description: "Please enter a repository path",
        variant: "destructive",
      });
      return;
    }

    analyzeRepoMutation.mutate(repoPath);
  };

  return (
    <Layout>
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Analyze Your Git Repository</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Get insights into your commit history, most edited files, and language usage
            without using GitHub API.
          </p>
          
          <div className="bg-card rounded-lg p-6 shadow-sm border">
            {analyzeRepoMutation.isError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {analyzeRepoMutation.error?.message || "Failed to analyze repository. Please try again."}
                </AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-left">
                <Label htmlFor="repoPath">Repository Path or URL</Label>
                <Input 
                  id="repoPath"
                  type="text"
                  placeholder="/path/to/repo or https://github.com/username/repo"
                  value={repoPath}
                  onChange={(e) => setRepoPath(e.target.value)}
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Enter the full path to your local Git repository or a GitHub URL
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={analyzeRepoMutation.isPending || isConnecting}
              >
                {analyzeRepoMutation.isPending || isConnecting ? 
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 animate-spin" /> 
                    {isConnecting ? "Connecting to server..." : "Analyzing..."}
                  </span> : 
                  "Analyze Repository"
                }
              </Button>
            </form>
          </div>
          
          <div className="mt-6">
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Connection Issues?</AlertTitle>
              <AlertDescription>
                <p>The API service might be starting up from cold storage. Please wait up to 2 minutes and try again if your first attempt fails.</p>
                <p className="mt-2">For testing, try using these example repositories:</p>
                <ul className="mt-1 list-disc pl-5 text-left">
                  <li>https://github.com/facebook/react</li>
                  <li>https://github.com/vercel/next.js</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
          
          <div className="mt-12">
            <h3 className="text-xl font-medium mb-4">How it works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card p-4 rounded-lg border">
                <div className="text-lg font-medium mb-2">1. Input Path</div>
                <p className="text-muted-foreground">Enter the path to your local Git repository or a Git URL</p>
              </div>
              <div className="bg-card p-4 rounded-lg border">
                <div className="text-lg font-medium mb-2">2. Analyze</div>
                <p className="text-muted-foreground">Our tool analyzes your Git history and files</p>
              </div>
              <div className="bg-card p-4 rounded-lg border">
                <div className="text-lg font-medium mb-2">3. View Insights</div>
                <p className="text-muted-foreground">Get visual charts and metrics about your repository</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default Index;
