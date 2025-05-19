
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto py-4">
          <h1 className="text-2xl font-bold">CommitMetrics</h1>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">About CommitMetrics</h2>
          
          <div className="space-y-8">
            <section className="prose">
              <p className="text-xl">
                CommitMetrics is a self-hostable tool that provides insights into your Git repositories
                without relying on external APIs like GitHub.
              </p>
            </section>
            
            <section>
              <h3 className="text-2xl font-semibold mb-4">Features</h3>
              <ul className="grid gap-3">
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-medium mr-2">✓</span>
                  <span>Analyze commit history with detailed statistics</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-medium mr-2">✓</span>
                  <span>View commits per day, week, or month</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-medium mr-2">✓</span>
                  <span>Identify most frequently edited files</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-medium mr-2">✓</span>
                  <span>Analyze language distribution in your codebase</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-medium mr-2">✓</span>
                  <span>Export insights as PDF reports</span>
                </li>
              </ul>
            </section>
            
            <section>
              <h3 className="text-2xl font-semibold mb-4">Privacy</h3>
              <div className="bg-muted p-4 rounded-lg">
                <p className="mb-2">CommitMetrics respects your privacy:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>All analysis is performed locally</li>
                  <li>No data is sent to external servers</li>
                  <li>No GitHub API or external services are used</li>
                  <li>Your code stays on your machine</li>
                </ul>
              </div>
            </section>
            
            <section>
              <h3 className="text-2xl font-semibold mb-4">How It Works</h3>
              <p className="mb-4">
                CommitMetrics uses Node.js to execute Git commands on your local 
                repository and analyze the output. The data is then visualized using Recharts.
              </p>
              <div className="bg-card p-4 rounded-lg border">
                <code className="block whitespace-pre overflow-x-auto text-sm">
{`# Sample Git commands used:
git log --pretty=format:"%h|%an|%ad|%s" --date=short
git log --name-only --pretty=format:
git ls-files`}
                </code>
              </div>
            </section>
            
            <section>
              <h3 className="text-2xl font-semibold mb-4">Get Started</h3>
              <Link to="/">
                <Button size="lg">Analyze a Repository</Button>
              </Link>
            </section>
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

export default About;
