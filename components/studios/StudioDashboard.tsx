// Plan Item ID: TI-1
import React from 'react';
import { motion } from 'motion/react';
import { StudioView } from '@/types';
import { ThreeDViewer } from '@/components/studios/ThreeDViewer';
import { VideoPlayer } from '@/components/studios/VideoPlayer';
import { ImageGallery } from '@/components/studios/ImageGallery';
import { AutomationStudio } from '@/components/studios/AutomationStudio';
import { BookStudio } from '@/components/studios/BookStudio';
import { SovereignDashboard } from '@/components/dashboard/SovereignDashboard';
import { KnowledgeHub } from '@/components/explorer/KnowledgeHub';
import { AudioStudio } from '@/components/studios/AudioStudio';
import { CodeStudio } from '@/components/studios/CodeStudio';
import { SyntheticBioStudio } from '@/components/studios/SyntheticBioStudio';
import { SovereignErrorBoundary } from '@/components/shared/SovereignErrorBoundary';
import { NetworkStudio } from './NetworkStudio';
import { DataVizStudio } from './DataVizStudio';
import { SimulationStudio } from './SimulationStudio';
import { MusicProductionStudio } from './MusicProductionStudio';
import { TextProcessingStudio } from './TextProcessingStudio';
import { SecurityStudio } from './SecurityStudio';
import { DatabaseStudio } from './DatabaseStudio';
import { CloudStudio } from './CloudStudio';
import { IoTStudio } from './IoTStudio';
import { GameStudio } from './GameStudio';
import BrowserStudio from './BrowserStudio';
import OSStudio from './OSStudio';
import IntelligenceHubStudio from './IntelligenceHubStudio';
import A2ACommunicationHubStudio from './A2ACommunicationHubStudio';
import BenchmarkStudio from './BenchmarkStudio';
import ProgressiveTestStudio from './ProgressiveTestStudio';
import EvolutionStudio from './EvolutionStudio';
import { Sparkles, Terminal } from 'lucide-react';
import { useEffect } from 'react';
import { SyntheticIntuitionEngine } from '@/engine/SyntheticIntuitionEngine';
import { PhotonicTensorCore } from '@/engine/PhotonicTensorCore';
import { OmniscientContextEngine } from '@/engine/OmniscientContextEngine';

interface StudioDashboardProps {
  studioView: StudioView;
}

export const StudioDashboard: React.FC<StudioDashboardProps> = ({ studioView }) => {
  const superIntelligence = {
    intuition: SyntheticIntuitionEngine.getInstance(),
    photonic: PhotonicTensorCore.getInstance(),
    context: OmniscientContextEngine.getInstance(),
  };

  // Super-intelligence auto-initializes via getInstance()

  // Defensive: Provide fallback data for test/benchmark studios when data is missing
  const needsFallbackData = studioView?.type === 'test' || studioView?.type === 'benchmark';
  const hasData = studioView?.data !== undefined && studioView?.data !== null;
  
  if (!studioView || (!hasData && !needsFallbackData)) {
    // Show placeholder for missing studios instead of nothing
    return (
      <div className="p-12 rounded-3xl border border-zinc-800 bg-zinc-950 flex flex-col items-center justify-center text-center gap-6">
        <div className="w-16 h-16 rounded-3xl bg-zinc-900 flex items-center justify-center border border-zinc-800">
          <Terminal size={32} className="text-zinc-500" />
        </div>
        <div>
          <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">No Studio Data</span>
          <p className="text-sm text-zinc-600 mt-2 font-mono">Waiting for studio initialization...</p>
        </div>
      </div>
    );
  }

  const renderStudio = () => {
    const status = (studioView as any).status || 'Operational';
    // Use fallback data when the studio type needs it
    const data = hasData ? studioView.data : { user: 'User', difficulty: 'easy' };
    
    return (
      <SovereignErrorBoundary moduleName={studioView.type.toUpperCase()}>
        {(() => {
          switch (studioView.type) {
            case '3d':
              return <ThreeDViewer data={data as any} status={status} />;
            case 'video':
              return <VideoPlayer data={data as any} status={status} onDataChange={() => {}} />;
            case 'image':
              return <ImageGallery data={data as any} status={status} />;
            case 'automation':
              return <AutomationStudio data={data as any} status={status} />;
            case 'book':
              return <BookStudio data={data as any} status={status} />;
            case 'system':
              return (
                <SovereignDashboard 
                  mission={(data as any)?.mission} 
                  artifacts={(data as any)?.artifacts} 
                  learningPulse={(data as any)?.learningPulse} 
                />
              );
            case 'knowledge':
              return <KnowledgeHub />;
            case 'music':
              return <AudioStudio data={data as any} status={status} />;
            case 'code':
              return <CodeStudio data={data as any} status={status} />;
            case 'bio':
              return <SyntheticBioStudio data={data as any} status={status} />;
            case 'network':
              return <NetworkStudio data={data as any} status={status} />;
            case 'dataviz':
              return <DataVizStudio data={data as any} status={status} />;
            case 'simulation':
              return <SimulationStudio data={data as any} status={status} />;
            case 'music-production':
              return <MusicProductionStudio data={data as any} status={status} />;
            case 'text':
              return <TextProcessingStudio data={data as any} status={status} />;
            case 'security':
              return <SecurityStudio data={data as any} status={status} />;
            case 'database':
              return <DatabaseStudio data={data as any} status={status} />;
            case 'cloud':
              return <CloudStudio data={data as any} status={status} />;
            case 'iot':
              return <IoTStudio data={data as any} status={status} />;
            case 'game':
              return <GameStudio data={data as any} status={status} />;
            case 'browser':
              return <BrowserStudio data={data as any} status={status} />;
            case 'os':
              return <OSStudio data={data as any} status={status} />;
            case 'intelligence':
              return <IntelligenceHubStudio data={data as any} status={status} />;
            case 'a2a':
              return <A2ACommunicationHubStudio data={data as any} status={status} />;
            case 'benchmark':
              return <BenchmarkStudio data={data as any} status={status} />;
            case 'test':
              return <ProgressiveTestStudio data={data as any} status={status} />;
            case 'evolution':
              return <EvolutionStudio data={data as any} status={status} />;
            default:
              return (
                <div className="p-12 rounded-3xl border border-zinc-800 bg-zinc-950 flex flex-col items-center justify-center text-center gap-6">
                  <div className="w-16 h-16 rounded-3xl bg-zinc-900 flex items-center justify-center border border-zinc-800">
                     <Terminal size={32} className="text-zinc-500" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Unsupported Studio Node</span>
                    <p className="text-sm text-zinc-600 mt-2 font-mono">TYPE_MISMATCH: {studioView.type.toUpperCase()}</p>
                  </div>
                </div>
              );
          }
        })()}
      </SovereignErrorBoundary>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full mt-6"
    >
      {renderStudio()}
    </motion.div>
  );
};


// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
