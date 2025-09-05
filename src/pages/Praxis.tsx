
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Praxis = () => {
  return (
    <div className="h-screen bg-zinc-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 flex-shrink-0 bg-zinc-900">
        <h1 className="text-2xl font-medium title-gradient">Praxis</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-8 py-6 min-h-0 overflow-y-auto">
        <Card className="max-w-2xl mx-auto bg-[#1F1F1F] border-zinc-700/50">
          <CardHeader>
            <CardTitle className="text-zinc-100">Praxis Core</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-300">Core Praxis functionality will be implemented here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Praxis;
