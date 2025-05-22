
import React from "react";
import Layout from "@/components/Layout";

const About = () => {
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">About CommitMetrics</h1>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">What is CommitMetrics?</h2>
              <p className="text-muted-foreground">
                CommitMetrics is an open-source tool that provides insights into GitHub repositories.
                Analyze commit history, contributor activity, and language usage with a simple, 
                intuitive interface.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">Features</h2>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>Commit history analysis</li>
                <li>Contributor statistics</li>
                <li>Most modified files tracking</li>
                <li>Language usage breakdown</li>
                <li>Commit frequency visualization</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">How it Works</h2>
              <p className="text-muted-foreground">
                CommitMetrics uses the GitHub API to fetch repository data, then processes and 
                visualizes this information using modern charting libraries. All processing happens 
                server-side for optimal performance.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">Privacy & Data Usage</h2>
              <p className="text-muted-foreground">
                CommitMetrics only analyzes public repositories. No data is stored permanently on our servers,
                and all analysis happens on-demand. We don't track or store your GitHub credentials.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
