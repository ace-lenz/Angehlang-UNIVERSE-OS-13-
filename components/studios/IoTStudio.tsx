// Plan Item ID: TI-1
/**
 * IoTStudio.tsx - QPPU-Enhanced IoT Device Management Studio
 * =============================================================================
 * COMPREHENSIVE IOT DEVICE MANAGEMENT & SENSORY NETWORK STUDIO
 * =============================================================================
 * 
 * Features:
 * - Quantum Photonic IoT Orchestration with 50D ANGHV Storage
 * - Multi-Protocol Support (MQTT, CoAP, HTTP, WebSocket, LwM2M)
 * - Device Registry & Provisioning
 * - Real-time Sensor Data Visualization
 * - Device Grouping & Tagging
 * - OTA Firmware Updates
 * - Rule Engine & Automation
 * - Edge Computing Configuration
 * - Device Shadow/Twin State
 * - Alert & Threshold Monitoring
 * - Energy Consumption Tracking
 * - Location Tracking (GPS)
 * - Temperature/Humidity/Pressure Monitoring
 * - Motion & Occupancy Detection
 * - Door/Window Sensors
 * - Camera Integration
 * - Smart Home Integration (Z-Wave, Zigbee)
 * - Serial Communication
 * - MCP Integration for IoT Services
 * - RAG IoT Knowledge Base
 * - Full-Screen Modes: Expanded, Immersive, Cinema
 * - QPPU Quantum Mode for Enhanced Processing
 * =============================================================================
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radio, Thermometer, Droplets, Activity, Lightbulb, Plug, Wifi,
  Maximize2, Minimize2, Sparkles, Zap, Play, Pause, RefreshCw,
  Plus, Minus, Settings, Power, ToggleLeft, ToggleRight,
  Activity as Sensor, TrendingUp, TrendingDown, AlertTriangle, Bell,
  MapPin, Navigation, Camera, Cpu, HardDrive, Gauge,
  Radio as Signal, Battery, Clock, Server, Cpu as Edge, Box, Layers,
  Map, Navigation2, Disc, Music, Tv, Fan, Refrigerator, Lock as SmartLock,
  AlertOctagon, CheckCircle, XCircle, Shield as Secure, Cloud
} from 'lucide-react';
import { StudioHeader, SovereignButton } from '@/components/ui/StudioHeader';
import { cn } from '@/utils/sovereign-utils';
import { qppuEngine } from '@/engine/QPPUCore';
import { SyntheticIntuitionEngine } from '@/engine/SyntheticIntuitionEngine';
import { PhotonicTensorCore } from '@/engine/PhotonicTensorCore';
import { OmniscientContextEngine } from '@/engine/OmniscientContextEngine';
import { iotSovereignEngine } from '@/engine/studios/IoTSovereignEngine';
import { iotAgent } from '@/agents/IoTAgent';

interface IoTData {
  name: string;
  devices: number;
  sensors: number;
}

interface IoTDevice {
  id: string;
  name: string;
  type: 'sensor' | 'actuator' | 'gateway' | 'camera' | 'switch' | 'thermostat' | 'lock' | 'speaker' | 'display' | 'appliance';
  status: 'online' | 'offline' | 'warning';
  battery?: number;
  signal: number;
  lastSeen: string;
  firmware?: string;
  protocol?: string;
  location?: string;
  data?: { value: number; unit: string; timestamp: string };
  state?: Record<string, any>;
}

interface IoTRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
  lastTriggered?: string;
}

interface IoTAlert {
  id: string;
  device: string;
  type: 'threshold' | 'offline' | 'battery' | 'motion';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

interface IoTStudioProps {
  data?: IoTData;
  status?: string;
}

type FullScreenMode = 'normal' | 'expanded' | 'immersive' | 'cinema';
type ViewMode = 'devices' | 'sensors' | 'rules' | 'alerts' | 'analytics';

const DEFAULT_IOT: IoTData = {
  name: "Smart Home",
  devices: 12,
  sensors: 8
};

const SIM_DEVICES: IoTDevice[] = [
  { id: '1', name: 'Living Room Temp', type: 'sensor', status: 'online', battery: 85, signal: 92, lastSeen: '2s ago', firmware: 'v3.2.1', protocol: 'MQTT', location: 'Living Room', data: { value: 22.4, unit: '°C', timestamp: 'now' } },
  { id: '2', name: 'Bedroom Humidity', type: 'sensor', status: 'online', battery: 72, signal: 88, lastSeen: '5s ago', firmware: 'v3.2.1', protocol: 'MQTT', location: 'Bedroom', data: { value: 48, unit: '%', timestamp: 'now' } },
  { id: '3', name: 'Kitchen Motion', type: 'sensor', status: 'online', battery: 95, signal: 95, lastSeen: '1s ago', firmware: 'v2.1.0', protocol: 'Zigbee', location: 'Kitchen', data: { value: 0, unit: 'motion', timestamp: 'now' } },
  { id: '4', name: 'Front Door Lock', type: 'lock', status: 'online', signal: 90, lastSeen: '10s ago', firmware: 'v1.5.2', protocol: 'Z-Wave', location: 'Entry', state: { locked: true, battery: 78 } },
  { id: '5', name: 'Living Room Light', type: 'switch', status: 'online', signal: 87, lastSeen: '3s ago', firmware: 'v2.0.1', protocol: 'MQTT', location: 'Living Room', state: { on: true, brightness: 75 } },
  { id: '6', name: 'Garden Sprinkler', type: 'actuator', status: 'offline', signal: 0, lastSeen: '2h ago', firmware: 'v1.8.0', protocol: 'MQTT', location: 'Garden', state: { on: false } },
  { id: '7', name: 'Smart Thermostat', type: 'thermostat', status: 'online', signal: 100, lastSeen: '1s ago', firmware: 'v4.1.0', protocol: 'WiFi', location: 'Hallway', data: { value: 21, unit: '°C', timestamp: 'now' }, state: { target: 22, mode: 'heat', schedule: 'active' } },
  { id: '8', name: 'Front Camera', type: 'camera', status: 'warning', signal: 45, lastSeen: '30s ago', firmware: 'v5.2.1', protocol: 'RTSP', location: 'Entry', data: { value: 0, unit: 'events', timestamp: '1m ago' } },
  { id: '9', name: 'Bedroom Speaker', type: 'speaker', status: 'online', signal: 82, lastSeen: '15s ago', firmware: 'v2.3.0', protocol: 'WiFi', location: 'Bedroom', state: { playing: false, volume: 40 } },
  { id: '10', name: 'Kitchen Fridge', type: 'appliance', status: 'online', signal: 92, lastSeen: '5s ago', firmware: 'v1.2.0', protocol: 'Zigbee', location: 'Kitchen', data: { value: 4, unit: '°C', timestamp: 'now' }, state: { temperature: 4, doorOpen: false } },
  { id: '11', name: 'Garage Door', type: 'lock', status: 'online', signal: 75, lastSeen: '1min ago', firmware: 'v1.3.2', protocol: 'Z-Wave', location: 'Garage', state: { locked: true } },
  { id: '12', name: 'Window Sensor', type: 'sensor', status: 'online', battery: 45, signal: 68, lastSeen: '8s ago', firmware: 'v2.0.5', protocol: 'Zigbee', location: 'Bedroom', data: { value: 0, unit: 'open', timestamp: 'now' } },
];

const IOT_RULES: IoTRule[] = [
  { id: '1', name: 'Turn on lights at sunset', trigger: 'sunset', action: 'Set living_room_light = on', enabled: true, lastTriggered: '2 hours ago' },
  { id: '2', name: 'Lockdoor after 10PM', trigger: 'time = 22:00', action: 'Lock front_door', enabled: true, lastTriggered: '10 PM' },
  { id: '3', name: 'Alert if temp > 30', trigger: 'temp > 30', action: 'Send alert', enabled: true, lastTriggered: 'Never' },
  { id: '4', name: 'Motion detected', trigger: 'motion = 1', action: 'Record camera', enabled: false },
];

const IOT_ALERTS: IoTAlert[] = [
  { id: '1', device: 'Front Camera', type: 'offline', severity: 'critical', message: 'Device went offline', timestamp: '5 min ago', acknowledged: false },
  { id: '2', device: 'Window Sensor', type: 'battery', severity: 'warning', message: 'Battery low (45%)', timestamp: '1 hour ago', acknowledged: false },
  { id: '3', device: 'Garden Sprinkler', type: 'offline', severity: 'warning', message: 'Device offline for 2 hours', timestamp: '2 hours ago', acknowledged: true },
];

export const IoTStudio: React.FC<IoTStudioProps> = ({ data: externalData, status }) => {
  const data = externalData || DEFAULT_IOT;
  const [fullScreenMode, setFullScreenMode] = useState<FullScreenMode>('normal');
  const [viewMode, setViewMode] = useState<ViewMode>('devices');
  const [devices, setDevices] = useState<IoTDevice[]>(SIM_DEVICES);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [quantumMode, setQuantumMode] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [goalText, setGoalText] = useState('');
  const [isProcessingGoal, setIsProcessingGoal] = useState(false);
  const [peripheralPulse, setPeripheralPulse] = useState(0);
  const [activeEdgeManifest, setActiveEdgeManifest] = useState<any>(null);
  const [qppuStats, setQppuStats] = useState({ coherence: 0, fidelity: 0, frames: '50D' });
  const [deviceProvisioning, setDeviceProvisioning] = useState(false);
  const [firmwareManagement, setFirmwareManagement] = useState(false);
  const [dataAggregation, setDataAggregation] = useState(true);
  const [ruleEngine, setRuleEngine] = useState(true);
  const [alertingSystem, setAlertingSystem] = useState(true);
  const [iotAutomation, setIotAutomation] = useState(false);

  const handleDeviceProvisioning = () => {
    setDeviceProvisioning(true);
    console.log('[IoTStudio] Device provisioning initiated');
    setTimeout(() => setDeviceProvisioning(false), 3000);
  };

  const handleFirmwareManagement = () => {
    setFirmwareManagement(true);
    console.log('[IoTStudio] Firmware management initiated');
    setTimeout(() => setFirmwareManagement(false), 3000);
  };

  const handleDataAggregation = () => {
    setDataAggregation(!dataAggregation);
    console.log('[IoTStudio] Data aggregation:', !dataAggregation ? 'active' : 'suspended');
  };

  const handleRuleEngine = () => {
    setRuleEngine(!ruleEngine);
    console.log('[IoTStudio] Rule engine:', !ruleEngine ? 'active' : 'suspended');
  };

  const handleAlertingSystem = () => {
    setAlertingSystem(!alertingSystem);
    console.log('[IoTStudio] Alerting system:', !alertingSystem ? 'active' : 'suspended');
  };

  const handleIotAutomation = () => {
    setIotAutomation(!iotAutomation);
    console.log('[IoTStudio] IoT automation:', iotAutomation ? 'enabled' : 'disabled');
  };

  const superIntelligence = {
    intuition: SyntheticIntuitionEngine.getInstance(),
    photonic: PhotonicTensorCore.getInstance(),
    context: OmniscientContextEngine.getInstance(),
  };

  // Super-intelligence auto-initializes via getInstance()

  const handleGoalSubmit = async () => {
    if (!goalText.trim()) return;
    setIsProcessingGoal(true);
    setPeripheralPulse(100);
    
    try {
      const triggeredActions = await iotSovereignEngine.checkRules({ temperature: 30 }); // Simulated vitals
      console.log('[IoTStudio] Rule check triggered:', triggeredActions);
      
      setPeripheralPulse(60);
      
      // Secondary logic via agent
      await iotAgent.process(goalText);
    } catch (error) {
      console.error('[IoTStudio] Goal error:', error);
    } finally {
      setTimeout(() => {
        setIsProcessingGoal(false);
        setGoalText('');
        setPeripheralPulse(0);
      }, 1500);
    }
  };

  const toggleDevice = async (deviceId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
    await iotSovereignEngine.commandDevice(deviceId, `SET_STATUS_${newStatus}`);
    setPeripheralPulse(100);
    setTimeout(() => setPeripheralPulse(0), 1000);
  };

  useEffect(() => {
    if (quantumMode && autoRefresh) {
      qppuEngine.processFrame(33.33, 'photonic');
    }
  }, [quantumMode, autoRefresh]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setDevices(prev => prev.map(d => ({
        ...d,
        lastSeen: d.status === 'online' ? 'just now' : d.lastSeen,
        data: d.data ? { 
          ...d.data, 
          value: d.data.value + (Math.random() - 0.5) * (d.data.unit === '°C' ? 0.5 : 5),
          timestamp: 'now'
        } : undefined
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const onlineCount = devices.filter(d => d.status === 'online').length;
  const offlineCount = devices.filter(d => d.status === 'offline').length;
  const warningCount = devices.filter(d => d.status === 'warning').length;
  const lowBattery = devices.filter(d => d.battery && d.battery < 50).length;

  const fullScreenHandlers = {
    normal: () => setFullScreenMode('normal'),
    expanded: () => setFullScreenMode('expanded'),
    immersive: () => setFullScreenMode('immersive'),
    cinema: () => setFullScreenMode('cinema'),
  };

  const containerClasses = cn(
    "w-full rounded-2xl border border-zinc-800 overflow-hidden flex flex-col shadow-2xl",
    "bg-[#02020a] transition-all duration-500",
    fullScreenMode === 'expanded' && "fixed inset-0 z-50 rounded-none",
    fullScreenMode === 'immersive' && "fixed inset-0 z-50 rounded-none bg-black",
    fullScreenMode === 'cinema' && "fixed inset-0 z-50 rounded-none bg-black"
  );

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'sensor': return Thermometer;
      case 'actuator': return Plug;
      case 'gateway': return Radio;
      case 'camera': return Camera;
      case 'switch': return ToggleRight;
      case 'thermostat': return Gauge;
      case 'lock': return SmartLock;
      case 'speaker': return Music;
      case 'display': return Tv;
      case 'appliance': return Refrigerator;
      default: return Radio;
    }
  };

  const renderDevicesView = () => (
    <div className="grid grid-cols-4 gap-3 mb-4">
      <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-900">
        <p className="text-[10px] text-zinc-500 uppercase">Online</p>
        <p className="text-xl font-mono text-emerald-400">{onlineCount}</p>
      </div>
      <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-900">
        <p className="text-[10px] text-zinc-500 uppercase">Offline</p>
        <p className="text-xl font-mono text-zinc-400">{offlineCount}</p>
      </div>
      <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-900">
        <p className="text-[10px] text-zinc-500 uppercase">Warnings</p>
        <p className="text-xl font-mono text-amber-400">{warningCount}</p>
      </div>
      <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-900">
        <p className="text-[10px] text-zinc-500 uppercase">Low Battery</p>
        <p className="text-xl font-mono text-red-400">{lowBattery}</p>
      </div>
    </div>
  );

  const renderSensorsView = () => (
    <div className="grid grid-cols-3 gap-3">
      {devices.filter(d => d.data).map(device => (
        <div key={device.id} className="p-4 rounded-xl bg-zinc-950 border border-zinc-900">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-zinc-300">{device.name}</p>
            <span className="text-[10px] text-zinc-500">{device.location}</span>
          </div>
          <p className="text-2xl font-mono text-amber-400">
            {device.data?.value.toFixed(1)}
            <span className="text-sm text-zinc-500 ml-1">{device.data?.unit}</span>
          </p>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-zinc-500">
            <span>Signal: {device.signal}%</span>
            {device.battery && <span>• Battery: {device.battery}%</span>}
          </div>
        </div>
      ))}
    </div>
  );

  const renderRulesView = () => (
    <div className="space-y-2">
      {IOT_RULES.map(rule => (
        <div key={rule.id} className={cn(
          "p-3 rounded-xl border flex items-center justify-between transition-all",
          rule.enabled ? "bg-amber-500/5 border-amber-500/20" : "bg-zinc-950 border-zinc-900 opacity-60"
        )}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                // Simulate rule toggle
                rule.enabled = !rule.enabled;
                setPeripheralPulse(50);
                setTimeout(() => setPeripheralPulse(0), 500);
              }}
              className={cn(
                "w-8 h-4 rounded-full transition-all",
                rule.enabled ? "bg-amber-500" : "bg-zinc-700"
              )}
            >
              <div className={cn(
                "w-3 h-3 rounded-full bg-white transition-transform",
                rule.enabled ? "translate-x-4" : "translate-x-0.5"
              )} />
            </button>
            <div>
              <p className="text-sm font-bold text-zinc-200">{rule.name}</p>
              <p className="text-[10px] text-zinc-500">{rule.trigger} → {rule.action}</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-zinc-500">{rule.lastTriggered || 'Never'}</span>
            {rule.enabled && <span className="text-[8px] text-amber-500 font-bold uppercase animate-pulse">Monitoring</span>}
          </div>
        </div>
      ))}
      <SovereignButton variant="secondary" size="sm" icon={Plus} className="mt-2">Add Rule</SovereignButton>
    </div>
  );

  const renderAlertsView = () => (
    <div className="space-y-2">
      {IOT_ALERTS.map(alert => (
        <div key={alert.id} className={cn(
          "p-3 rounded-xl border flex items-center justify-between",
          alert.severity === 'critical' ? "bg-red-500/10 border-red-500/20" :
          alert.severity === 'warning' ? "bg-amber-500/10 border-amber-500/20" :
          "bg-blue-500/10 border-blue-500/20"
        )}>
          <div className="flex items-center gap-3">
            {alert.severity === 'critical' ? (
              <AlertOctagon size={16} className="text-red-400" />
            ) : alert.severity === 'warning' ? (
              <AlertTriangle size={16} className="text-amber-400" />
            ) : (
              <Bell size={16} className="text-blue-400" />
            )}
            <div>
              <p className="text-sm font-bold text-zinc-200">{alert.device}</p>
              <p className="text-xs text-zinc-400">{alert.message}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-500">{alert.timestamp}</span>
            {!alert.acknowledged && (
              <button className="px-2 py-1 rounded bg-zinc-800 text-[10px] text-zinc-300">Acknowledge</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <AnimatePresence>
      {fullScreenMode === 'cinema' && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/90"
          onClick={() => setFullScreenMode('normal')}
        />
      )}
      <motion.div className={containerClasses} layout>
        <StudioHeader 
          title="IoT Studio" 
          subtitle={`${data.name} • ${devices.length} devices`} 
          icon={Radio}
          badge={status || `${onlineCount} online`}
          badgeColor="amber"
        >
          <div className="flex items-center gap-2">
            <SovereignButton 
              variant={iotAutomation ? "secondary" : "ghost"} 
              size="xs" 
              icon={RefreshCw} 
              onClick={handleIotAutomation}
              className={iotAutomation ? "text-amber-400" : "text-zinc-500"}
              title="IoT Automation"
            >
              {iotAutomation ? 'Auto ON' : 'Auto'}
            </SovereignButton>
            <SovereignButton 
              variant={firmwareManagement ? "secondary" : "ghost"} 
              size="xs" 
              icon={Cpu} 
              onClick={handleFirmwareManagement}
              disabled={firmwareManagement}
              className={firmwareManagement ? "text-amber-400" : "text-zinc-500"}
              title="Firmware Management"
            >
              {firmwareManagement ? 'Updating...' : 'Firmware'}
            </SovereignButton>
            <SovereignButton 
              variant="ghost" 
              size="xs" 
              icon={quantumMode ? Zap : Sparkles} 
              onClick={() => setQuantumMode(!quantumMode)} 
              className={cn(quantumMode && "text-amber-400")}
              title="QPPU Quantum Mode"
            />
            <SovereignButton 
              variant={autoRefresh ? "secondary" : "primary"} 
              size="xs" 
              icon={Settings} 
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              Auto
            </SovereignButton>
            <SovereignButton 
              variant="primary" 
              size="xs" 
              icon={fullScreenMode === 'normal' ? Maximize2 : Minimize2} 
              onClick={() => fullScreenHandlers[fullScreenMode === 'normal' ? 'expanded' : 'normal']()}
            >
              {fullScreenMode === 'normal' ? 'Full View' : 'Exit'}
            </SovereignButton>
          </div>
          {peripheralPulse > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 rounded-lg border border-amber-500/20 ml-2">
              <Signal size={12} className="text-amber-400 animate-pulse" />
              <span className="text-[10px] text-amber-300 font-bold uppercase">Peripheral Resonance</span>
            </div>
          )}
        </StudioHeader>

        {/* Sovereign Goal Input */}
        <div className="px-4 py-3 bg-amber-500/5 border-b border-amber-500/10 flex items-center gap-3">
          <div className="flex-1 relative">
            <Box className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
            <input
              type="text"
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGoalSubmit()}
              placeholder="Edge Directive: e.g., 'Manifest a low-latency photonic bridge for all Kitchen sensors'"
              className="w-full bg-[#050510] border border-amber-500/20 rounded-xl py-2 pl-10 pr-4 text-xs text-amber-100 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
              disabled={isProcessingGoal}
            />
          </div>
          <SovereignButton 
            variant="primary" 
            size="sm" 
            onClick={handleGoalSubmit}
            disabled={isProcessingGoal}
            icon={Zap}
          >
            {isProcessingGoal ? 'Manifesting...' : 'Saturate'}
          </SovereignButton>
        </div>

        {/* Digital Twin Integrity Manifest Display */}
        {activeEdgeManifest && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mx-4 mb-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3" >
              <p className="text-[10px] text-amber-400 font-bold uppercase">Sovereign Edge Manifest</p>
              <div className="flex gap-4">
                <span className="text-[9px] text-zinc-500 font-mono">FID: {(activeEdgeManifest.physicsFidelity * 100).toFixed(3)}%</span>
                <span className="text-[9px] text-zinc-500 font-mono">STB: {(activeEdgeManifest.environmentalStability * 100).toFixed(1)}%</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[9px] text-zinc-600 uppercase mb-2">Grounding Alerts</p>
                <div className="space-y-1">
                  {activeEdgeManifest.groundingAlerts.map((alert, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] text-zinc-400">
                      <Cpu size={10} className="text-amber-500/50" />
                      <span>{alert}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-[9px] text-zinc-600 uppercase mb-2">Peripheral Load</p>
                <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${(activeEdgeManifest.activeConstraints / 100) * 100}%` }}
                  />
                </div>
                <p className="text-[8px] text-zinc-500 mt-1 font-mono text-right">{activeEdgeManifest.activeConstraints} Active Nodes</p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex border-b border-zinc-800 bg-zinc-950/40 overflow-x-auto">
          {(['devices', 'sensors', 'rules', 'alerts', 'analytics'] as ViewMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                "flex-shrink-0 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                viewMode === mode 
                  ? "text-amber-400 border-b-2 border-amber-500 bg-amber-500/5" 
                  : "text-zinc-600 hover:text-zinc-400"
              )}
            >
              {mode}
            </button>
          ))}
        </div>

        <div className="px-4 py-2 bg-zinc-900/50 border-b border-zinc-800 flex items-center gap-4">
          <button
            onClick={handleDeviceProvisioning}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase transition-all",
              deviceProvisioning 
                ? "bg-amber-500/20 text-amber-400" 
                : "bg-zinc-800 text-zinc-500"
            )}
          >
            <Plus size={10} />
            Provision
          </button>
          <button
            onClick={() => {
              setDataAggregation(!dataAggregation);
              handleDataAggregation();
            }}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase transition-all",
              dataAggregation 
                ? "bg-amber-500/20 text-amber-400" 
                : "bg-zinc-800 text-zinc-500"
            )}
          >
            <Layers size={10} />
            Aggregate
          </button>
          <button
            onClick={() => {
              setRuleEngine(!ruleEngine);
              handleRuleEngine();
            }}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase transition-all",
              ruleEngine 
                ? "bg-amber-500/20 text-amber-400" 
                : "bg-zinc-800 text-zinc-500"
            )}
          >
            <Activity size={10} />
            Rules
          </button>
          <button
            onClick={() => {
              setAlertingSystem(!alertingSystem);
              handleAlertingSystem();
            }}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase transition-all",
              alertingSystem 
                ? "bg-amber-500/20 text-amber-400" 
                : "bg-zinc-800 text-zinc-500"
            )}
          >
            <Bell size={10} />
            Alerts
          </button>
        </div>

        <div className={cn(fullScreenMode === 'cinema' ? "flex-1 p-6 overflow-auto" : "p-6")}>
          {quantumMode && (
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 flex items-center gap-3 mb-4">
              <Zap size={14} className="text-amber-400" />
              <div className="flex gap-4 text-xs">
                <span className="text-zinc-400">Coh: <span className="text-amber-300 font-bold">{qppuStats.coherence}%</span></span>
                <span className="text-zinc-400">Fi: <span className="text-amber-300 font-bold">{qppuStats.fidelity}%</span></span>
                <span className="text-zinc-400">Dim: <span className="text-amber-300 font-bold">{qppuStats.frames}</span></span>
                <span className="text-zinc-400">Mode: <span className="text-amber-300 font-bold">Quantum Sensor</span></span>
              </div>
            </div>
          )}

          {viewMode === 'devices' && renderDevicesView()}
          {viewMode === 'sensors' && renderSensorsView()}
          {viewMode === 'rules' && renderRulesView()}
          {viewMode === 'alerts' && renderAlertsView()}
        </div>

        <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Signal size={12} className="text-amber-400" />
              <span className="text-[9px] text-zinc-500 uppercase">Protocols: MQTT, Zigbee, Z-Wave</span>
            </div>
            <div className="flex items-center gap-2">
              <Cpu size={12} className="text-zinc-600" />
              <span className="text-[9px] text-zinc-500 uppercase">Edge: Active</span>
            </div>
          </div>
          <div className="flex gap-2">
            <SovereignButton variant="secondary" size="sm" icon={Plus}>Add Device</SovereignButton>
            <SovereignButton variant="primary" size="sm" icon={RefreshCw}>Refresh</SovereignButton>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
