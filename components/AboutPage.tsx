
import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12 shadow-sm">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-6">About CRM Spotlight</h1>
        
        <div className="prose prose-slate lg:prose-lg max-w-none">
          <p className="text-xl text-slate-600 leading-relaxed mb-8">
            CRM Spotlight is an intelligent news aggregator designed specifically for CRM professionals, developers, and industry analysts. Our mission is to filter through the noise of the internet to bring you high-impact, verified CRM intelligence.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </span>
                6-Hour Intelligence Cycle
              </h3>
              <p className="text-slate-600">
                Our system performs deep-web scans every 6 hours. This frequency ensures that you're always informed about the latest product releases, major acquisitions, and strategic market shifts as they happen.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </span>
                AI-Verified Sourcing
              </h3>
              <p className="text-slate-600">
                Leveraging the power of Gemini 3 Flash, we verify every headline against multiple sources to prevent hallucinations and ensure all links are active and relevant before they ever reach your feed.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 mb-12">
            <h4 className="text-lg font-bold text-slate-900 mb-3">Historical Context</h4>
            <p className="text-slate-600">
              We have been tracking industry movements since January 6, 2025. This allows users to search back through recent history to see how trends developed across the Salesforce, HubSpot, and Microsoft ecosystems.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-4">Core Technology</h2>
          <ul className="space-y-3 text-slate-600">
            <li className="flex items-start">
              <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <span><strong>Google Search Grounding:</strong> Real-time web retrieval for current events.</span>
            </li>
            <li className="flex items-start">
              <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <span><strong>Intelligent Summarization:</strong> Distilling complex news into 2-sentence insights.</span>
            </li>
            <li className="flex items-start">
              <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <span><strong>Automated Categorization:</strong> Smart tagging across major CRM platforms.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
