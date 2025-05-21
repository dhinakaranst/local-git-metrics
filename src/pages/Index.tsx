
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import Layout from "@/components/Layout";
import { useMutation } from "@tanstack/react-query";
import repoService from "@/services/repoService";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2, WifiOff } from "lucide-react";

const Index = () => {
  const [repoPath, setRepoPath] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []); // Fixed: Added empty dependency array to useEffect

  // Mutation for analyzing repository
  const analyzeRepoMutation = useMutation({
    mutationFn: (path: string) => {
      return repoService.analyzeRepo(path);
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Repository analyzed successfully",
      });
      navigate(`/dashboard?path=${encodeURIComponent(repoPath)}`);
    },
    onError: (error: Error) => {
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
            Get insights into your commit history, most edited files, and language usage.
          </p>
          
          {!isOnline && (
            <Alert variant="destructive" className="mb-6">
              <WifiOff className="h-4 w-4" />
              <AlertTitle>You are offline</AlertTitle>
              <AlertDescription>
                Please check your internet connection to analyze repositories.
              </AlertDescription>
            </Alert>
          )}

          {analyzeRepoMutation.isError && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>API Connection Error</AlertTitle>
              <AlertDescription>
                {analyzeRepoMutation.error instanceof Error 
                  ? analyzeRepoMutation.error.message 
                  : 'Unable to connect to the API server. It may be starting up or unavailable.'}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="bg-card rounded-lg p-6 shadow-sm border">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-left">
                <Label htmlFor="repoPath">Repository URL</Label>
                <Input 
                  id="repoPath"
                  type="text"
                  placeholder="https://github.com/username/repo"
                  value={repoPath}
                  onChange={(e) => setRepoPath(e.target.value)}
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Enter a GitHub URL like https://github.com/username/repo
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={analyzeRepoMutation.isPending || !isOnline}
              >
                {analyzeRepoMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : "Analyze Repository"}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default Index;
