import type {
  ApiResponse,
  EC2CalculateRequest,
  EC2CalculateResponse,
  RDSCalculateRequest,
  RDSCalculateResponse,
  SnapshotCalculateResponse,
  ReservedInstanceCompareRequest,
  ReservedInstanceCompareResponse,
  MultiRegionCompareRequest,
  MultiRegionCompareResponse,
  OptimizationRequest,
  OptimizationResponse,
  InstanceSearchParams,
  InstanceSearchResponse,
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_AWS_API_BASE_URL || 'http://localhost:3001';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

class AWSApiClient {
  private baseURL: string;
  private anonKey: string;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.anonKey = SUPABASE_ANON_KEY;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.anonKey && { Authorization: `Bearer ${this.anonKey}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          success: false,
          error: {
            code: 'HTTP_ERROR',
            message: `HTTP ${response.status}: ${response.statusText}`,
          },
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: 'unknown',
            version: '1.0.0',
          },
        }));
        return errorData;
      }

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network request failed',
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: 'unknown',
          version: '1.0.0',
        },
      };
    }
  }

  async calculateEC2(request: EC2CalculateRequest): Promise<ApiResponse<EC2CalculateResponse>> {
    return this.request<EC2CalculateResponse>('/api/v1/pricing/ec2/calculate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async calculateRDS(request: RDSCalculateRequest): Promise<ApiResponse<RDSCalculateResponse>> {
    return this.request<RDSCalculateResponse>('/api/v1/pricing/rds/calculate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async calculateSnapshots(
    region: string,
    volumeSizeGB: number,
    usedPercent: number,
    dailyChangePercent: number,
    retentionDays: number,
    storageType: 'standard' | 'archive',
    compressionFactor?: number
  ): Promise<ApiResponse<SnapshotCalculateResponse>> {
    const params = new URLSearchParams({
      region,
      volumeSizeGB: volumeSizeGB.toString(),
      usedPercent: usedPercent.toString(),
      dailyChangePercent: dailyChangePercent.toString(),
      retentionDays: retentionDays.toString(),
      storageType,
    });

    if (compressionFactor !== undefined) {
      params.append('compressionFactor', compressionFactor.toString());
    }

    return this.request<SnapshotCalculateResponse>(
      `/api/v1/pricing/snapshots/calculate?${params.toString()}`,
      { method: 'GET' }
    );
  }

  async compareReservedInstances(
    request: ReservedInstanceCompareRequest
  ): Promise<ApiResponse<ReservedInstanceCompareResponse>> {
    return this.request<ReservedInstanceCompareResponse>(
      '/api/v1/pricing/reserved-instances/compare',
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  }

  async compareRegions(
    request: MultiRegionCompareRequest
  ): Promise<ApiResponse<MultiRegionCompareResponse>> {
    return this.request<MultiRegionCompareResponse>('/api/v1/pricing/regions/compare', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getOptimizationRecommendations(
    request: OptimizationRequest
  ): Promise<ApiResponse<OptimizationResponse>> {
    return this.request<OptimizationResponse>('/api/v1/pricing/optimize', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async searchInstances(params: InstanceSearchParams): Promise<ApiResponse<InstanceSearchResponse>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request<InstanceSearchResponse>(
      `/api/v1/pricing/search?${searchParams.toString()}`
    );
  }
}

export const awsApiClient = new AWSApiClient();
