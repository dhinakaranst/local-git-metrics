
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import Layout from "@/components/Layout";
import { useMutation } from "@tanstack/react-query";
import repoService from "@/services/repoService";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { wakeUpServer } from "@/services/api";

const Index = () => {
  const [repoPath, setRepoPath] = useState("");
  const [serverStatus, setServerStatus] = useState<"checking" | "online" | "offline">("checking");
  const navigate = useNavigate();

  // Check server status on component mount
  useState(() => {
    const checkServer = async () => {
      const isOnline = await wakeUpServer();
      setServerStatus(isOnline ? "online" : "offline");
    };
    
    checkServer();
  });

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
      
      // More specific error message based on the error
      if (serverStatus === "offline") {
        toast({
          title: "Server Connection Error",
          description: "Our analysis server appears to be temporarily unavailable. Please try again in a few minutes.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Unable to analyze this repository. Please verify the URL format (https://github.com/username/repo) and try again.",
          variant: "destructive",
        });
      }
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate URL format
    if (!repoPath) {
      toast({
        title: "Error",
        description: "Please enter a repository path",
        variant: "destructive",
      });
      return;
    }

    // Check if URL format is valid (simple check)
    const githubUrlPattern = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/;
    if (!githubUrlPattern.test(repoPath)) {
      toast({
        title: "Invalid URL Format",
        description: "Please enter a valid GitHub repository URL in the format: https://github.com/username/repo",
        variant: "destructive",
      });
      return;
    }

    // Try to connect and analyze
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
          
          {serverStatus === "offline" && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Server Connection Issue</AlertTitle>
              <AlertDescription>
                We're having trouble connecting to our analysis server. You can still try to analyze repositories, but you may experience delays or errors.
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
                disabled={analyzeRepoMutation.isPending}
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
