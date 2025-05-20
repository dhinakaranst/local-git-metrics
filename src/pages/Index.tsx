
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import Layout from "@/components/Layout";
import { useMutation } from "@tanstack/react-query";
import repoService from "@/services/repoService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Clock, Settings, Wifi, WifiOff } from "lucide-react";
import { setCustomApiUrl, getCurrentApiUrl, checkApiConnection } from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const Index = () => {
  const [repoPath, setRepoPath] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const navigate = useNavigate();

  // Form schema for API URL
  const apiFormSchema = z.object({
    apiUrl: z.string().url("Please enter a valid URL").or(z.string().length(0))
  });

  const apiForm = useForm<z.infer<typeof apiFormSchema>>({
    resolver: zodResolver(apiFormSchema),
    defaultValues: {
      apiUrl: getCurrentApiUrl() === 'https://commit-metrics-api.onrender.com' ? '' : getCurrentApiUrl(),
    },
  });

  // Check API connectivity on component mount
  useEffect(() => {
    const checkConnection = async () => {
      setApiStatus('checking');
      const isConnected = await checkApiConnection();
      setApiStatus(isConnected ? 'online' : 'offline');

      // Only show toast for offline status
      if (!isConnected) {
        toast({
          title: "API Server Unavailable",
          description: "Cannot connect to the API server. It may be starting up from cold storage or temporarily unavailable.",
          variant: "destructive",
        });
      }
    };

    checkConnection();
    
    // Re-check connection every 30 seconds
    const intervalId = setInterval(checkConnection, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

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

    // Check API status before submitting
    if (apiStatus === 'offline') {
      const isConnected = await checkApiConnection();
      if (!isConnected) {
        toast({
          title: "API Server Unavailable",
          description: "Cannot connect to the API server. Please try again later or configure a different API URL.",
          variant: "destructive",
        });
        return;
      }
      setApiStatus('online');
    }

    analyzeRepoMutation.mutate(repoPath);
  };

  // Handle API URL form submission
  const onApiFormSubmit = (values: z.infer<typeof apiFormSchema>) => {
    if (values.apiUrl) {
      setCustomApiUrl(values.apiUrl);
      toast({
        title: "API URL Updated",
        description: "Custom API URL has been set. The app will use this URL for API requests.",
      });
    } else {
      setCustomApiUrl("");
      toast({
        title: "Default API URL Restored",
        description: "Using the default API URL for requests.",
      });
    }
    setShowApiSettings(false);
    
    // Check connection to the new API
    setTimeout(() => {
      checkApiConnection().then(isConnected => {
        setApiStatus(isConnected ? 'online' : 'offline');
      });
    }, 500);
  };

  // Render API status indicator
  const renderApiStatus = () => {
    switch (apiStatus) {
      case 'checking':
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center text-yellow-500">
                <Clock className="h-4 w-4 animate-pulse mr-1" />
                <span className="text-xs">Checking API...</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>Checking connection to API server</TooltipContent>
          </Tooltip>
        );
      case 'online':
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center text-green-500">
                <Wifi className="h-4 w-4 mr-1" />
                <span className="text-xs">API Online</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>Connected to {getCurrentApiUrl()}</TooltipContent>
          </Tooltip>
        );
      case 'offline':
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center text-red-500">
                <WifiOff className="h-4 w-4 mr-1" />
                <span className="text-xs">API Offline</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>Cannot connect to {getCurrentApiUrl()}</TooltipContent>
          </Tooltip>
        );
    }
  };

  return (
    <TooltipProvider>
      <Layout>
        <main className="flex-1 container mx-auto py-8 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-4xl font-bold">Analyze Your Git Repository</h2>
              <div className="flex items-center space-x-2">
                {renderApiStatus()}
                <Dialog open={showApiSettings} onOpenChange={setShowApiSettings}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>API Settings</DialogTitle>
                      <DialogDescription>
                        Configure custom API endpoint for repository analysis.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...apiForm}>
                      <form onSubmit={apiForm.handleSubmit(onApiFormSubmit)} className="space-y-4">
                        <FormField
                          control={apiForm.control}
                          name="apiUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Custom API URL (optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="https://your-custom-api.com" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
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
              
              {apiStatus === 'offline' && (
                <Alert variant="destructive" className="mb-4">
                  <WifiOff className="h-4 w-4" />
                  <AlertTitle>API Server Unavailable</AlertTitle>
                  <AlertDescription>
                    <p>Cannot connect to the API server at {getCurrentApiUrl()}.</p>
                    <p>It may be starting up from cold storage (this can take up to 2 minutes) or temporarily unavailable.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={async () => {
                        const isConnected = await checkApiConnection();
                        setApiStatus(isConnected ? 'online' : 'offline');
                        if (isConnected) {
                          toast({
                            title: "Connection Restored",
                            description: "Successfully connected to the API server.",
                          });
                        }
                      }}
                    >
                      Check Again
                    </Button>
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
                  disabled={analyzeRepoMutation.isPending || isConnecting || apiStatus === 'offline'}
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
                  <p className="mt-2">You can also set your own API URL by clicking the Settings icon above.</p>
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
    </TooltipProvider>
  );
};

export default Index;
