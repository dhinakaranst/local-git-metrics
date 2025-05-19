
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const [repoPath, setRepoPath] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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

    setIsLoading(true);
    
    // For now, we'll just navigate to the dashboard with the path as a parameter
    // In a real implementation, this would validate the repo path on the backend
    setTimeout(() => {
      setIsLoading(false);
      navigate(`/dashboard?path=${encodeURIComponent(repoPath)}`);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto py-4">
          <h1 className="text-2xl font-bold">CommitMetrics</h1>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Analyze Your Git Repository</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Get insights into your commit history, most edited files, and language usage
            without using GitHub API.
          </p>
          
          <div className="bg-card rounded-lg p-6 shadow-sm border">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-left">
                <Label htmlFor="repoPath">Repository Path</Label>
                <Input 
                  id="repoPath"
                  type="text"
                  placeholder="/path/to/your/repository"
                  value={repoPath}
                  onChange={(e) => setRepoPath(e.target.value)}
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Enter the full path to your local Git repository
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Analyzing..." : "Analyze Repository"}
              </Button>
            </form>
          </div>
          
          <div className="mt-12">
            <h3 className="text-xl font-medium mb-4">How it works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card p-4 rounded-lg border">
                <div className="text-lg font-medium mb-2">1. Input Path</div>
                <p className="text-muted-foreground">Enter the path to your local Git repository</p>
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
      
      <footer className="border-t mt-auto">
        <div className="container mx-auto py-4 text-center text-muted-foreground">
          <p>CommitMetrics &copy; 2025 - A self-hostable Git analytics tool</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
