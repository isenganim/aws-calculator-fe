export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  version: string;
  services: {
    database: {
      status: string;
      latencyMs: number;
    };
    redis: {
      status: string;
      latencyMs: number;
    };
    awsApi: {
      status: string;
    };
  };
}

export interface ApiMetadata {
  timestamp: string;
  requestId: string;
  version: string;
  region?: string;
  cacheHit?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: {
      errors?: Array<{
        field: string;
        message: string;
      }>;
    };
  };
  metadata: ApiMetadata;
}

export interface EC2Instance {
  type: string;
  quantity: number;
  operatingSystem?: 'Linux' | 'Windows' | 'RHEL' | 'SUSE';
  pricingModel: 'on-demand' | 'reserved';
  reservedTerm?: '1yr' | '3yr';
  paymentOption?: 'No Upfront' | 'Partial Upfront' | 'All Upfront';
}

export interface EBSVolume {
  type: 'gp2' | 'gp3' | 'io1' | 'io2' | 'st1' | 'sc1';
  sizeGB: number;
  iops?: number;
  throughputMBps?: number;
}

export interface SnapshotConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly';
  retentionDays: number;
  dailyChangePercent: number;
  storageType: 'standard' | 'archive';
  usedPercent?: number;
  compressionFactor?: number;
}

export interface NetworkingConfig {
  publicIPv4Count: number;
}

export interface EC2CalculateRequest {
  region: string;
  instance: EC2Instance;
  storage?: {
    volumes: EBSVolume[];
  };
  snapshots?: SnapshotConfig;
  networking?: NetworkingConfig;
}

export interface CostSummary {
  hourly: number;
  monthly: number;
  yearly: number;
  upfront?: number;
}

export interface EC2CalculateResponse {
  summary: CostSummary;
  breakdown: {
    compute: {
      instanceType: string;
      vcpu: number;
      memoryGB: number;
      hourly: number;
      monthly: number;
      upfront?: number;
    };
    storage: {
      volumes: Array<{
        type: string;
        sizeGB: number;
        iops?: number;
        throughputMBps?: number;
        monthly: number;
      }>;
      total: {
        monthly: number;
      };
    };
    snapshots?: {
      firstSnapshot: {
        sizeGB: number;
        monthly: number;
      };
      incrementalSnapshots: {
        totalSizeGB: number;
        monthly: number;
      };
      total: {
        monthly: number;
      };
    };
    networking?: {
      publicIPv4: {
        count: number;
        monthly: number;
      };
    };
  };
}

export interface RDSInstance {
  type: string;
  quantity: number;
  engine: 'MySQL' | 'PostgreSQL' | 'Aurora MySQL' | 'Aurora PostgreSQL' | 'MariaDB' | 'Oracle' | 'SQL Server';
  deploymentOption: 'Single-AZ' | 'Multi-AZ';
  pricingModel: 'on-demand' | 'reserved';
  reservedTerm?: '1yr' | '3yr';
  paymentOption?: 'No Upfront' | 'Partial Upfront' | 'All Upfront';
}

export interface RDSStorage {
  type: 'gp2' | 'gp3' | 'io1' | 'magnetic';
  allocatedGB: number;
  iops?: number;
}

export interface RDSBackup {
  retentionDays: number;
  dailyChangePercent: number;
  manualSnapshots?: {
    count: number;
    sizeGB: number;
  };
}

export interface RDSCalculateRequest {
  region: string;
  instance: RDSInstance;
  storage: RDSStorage;
  backup?: RDSBackup;
}

export interface RDSCalculateResponse {
  summary: CostSummary;
  breakdown: {
    compute: {
      instanceType: string;
      vcpu: number;
      memoryGB: number;
      hourly: number;
      monthly: number;
      upfront?: number;
    };
    storage: {
      type: string;
      allocatedGB: number;
      iops?: number;
      monthly: number;
    };
    backup?: {
      retentionDays: number;
      estimatedBackupSizeGB: number;
      monthly: number;
    };
  };
}

export interface SnapshotCalculateResponse {
  summary: {
    hourly: number;
    monthly: number;
    yearly: number;
  };
  breakdown: {
    firstSnapshot: {
      sizeGB: number;
      monthly: number;
    };
    incrementalSnapshots: {
      dailyChangeGB: number;
      totalSizeGB: number;
      monthly: number;
    };
    total: {
      sizeGB: number;
      monthly: number;
    };
  };
  pricing: {
    pricePerGBMonth: number;
    storageType: string;
  };
}

export interface ReservedInstanceCompareRequest {
  region: string;
  service: 'ec2' | 'rds';
  instanceType: string;
  quantity: number;
  operatingSystem?: 'Linux' | 'Windows' | 'RHEL' | 'SUSE';
  engine?: string;
}

export interface ReservedInstanceOption {
  term: string;
  paymentOption: string;
  hourlyRate: number;
  upfrontCost: number;
  effectiveMonthly: number;
  effectiveYearly: number;
  savings: {
    monthly: number;
    yearly: number;
    percentageVsOnDemand: number;
  };
}

export interface ReservedInstanceCompareResponse {
  instanceType: string;
  region: string;
  quantity: number;
  comparison: {
    onDemand: {
      hourlyRate: number;
      monthlyRate: number;
      yearlyRate: number;
    };
    reserved: ReservedInstanceOption[];
  };
  recommendation?: string;
}

export interface MultiRegionCompareRequest {
  regions: string[];
  service: 'ec2' | 'rds';
  configuration: EC2CalculateRequest | RDSCalculateRequest;
}

export interface RegionCost {
  region: string;
  monthlyCost: number;
  breakdown: EC2CalculateResponse['breakdown'] | RDSCalculateResponse['breakdown'];
}

export interface MultiRegionCompareResponse {
  service: string;
  regions: RegionCost[];
  cheapestRegion: {
    region: string;
    monthlyCost: number;
    savingsVsExpensive: number;
  };
  mostExpensiveRegion: {
    region: string;
    monthlyCost: number;
  };
}

export interface OptimizationRequest {
  region: string;
  currentConfiguration: {
    service: 'ec2' | 'rds';
    instanceType: string;
    pricingModel: 'on-demand' | 'reserved';
    storage?: {
      type: string;
      sizeGB: number;
    };
  };
  usagePattern?: {
    averageCPUUtilization: number;
    averageMemoryUtilization: number;
    hoursPerMonth: number;
  };
}

export interface OptimizationRecommendation {
  type: string;
  description: string;
  currentCost: number;
  optimizedCost: number;
  savings: number;
  savingsPercent: number;
  effort: 'low' | 'medium' | 'high';
  implementation: string;
}

export interface OptimizationResponse {
  currentConfiguration: {
    instanceType: string;
    monthlyCost: number;
  };
  recommendations: OptimizationRecommendation[];
  totalPotentialSavings: number;
}

export interface InstanceSearchParams {
  service: 'ec2' | 'rds';
  region: string;
  operatingSystem?: 'Linux' | 'Windows' | 'RHEL' | 'SUSE';
  minVCPU?: number;
  maxVCPU?: number;
  minMemoryGB?: number;
  maxMemoryGB?: number;
  instanceFamily?: string;
  engine?: string;
  sortBy?: 'price' | 'vcpu' | 'memory' | 'instanceType';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

export interface InstanceResult {
  instanceType: string;
  vcpu: number;
  memoryGB: number;
  instanceFamily: string;
  pricing: {
    onDemand: {
      hourly: number;
      monthly: number;
    };
    reserved?: {
      oneYearNoUpfront: number;
      oneYearPartialUpfront: number;
      oneYearAllUpfront: number;
    };
  };
  specifications?: {
    storage?: string;
    network?: string;
  };
}

export interface InstanceSearchResponse {
  service: string;
  region: string;
  filters: InstanceSearchParams;
  results: InstanceResult[];
  total: number;
}

export interface SavedConfiguration {
  id: string;
  user_id?: string;
  name: string;
  service: 'ec2' | 'rds';
  configuration: EC2CalculateRequest | RDSCalculateRequest;
  result?: EC2CalculateResponse | RDSCalculateResponse;
  created_at: string;
  updated_at: string;
}
