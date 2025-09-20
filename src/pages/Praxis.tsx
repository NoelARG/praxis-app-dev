import React from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { BookOpen } from 'lucide-react';

const Praxis = () => {
  return (
    <PageShell
      title="Praxis"
      subtitle="Philosophical Practice & Reflection"
      subtitleIcon={BookOpen}
    >
      <div className="space-y-8">
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-zinc-300 mb-2">Praxis</h2>
          <p className="text-zinc-500">
            This page is under construction.
          </p>
        </div>
      </div>
    </PageShell>
  );
};

export default Praxis;
