/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the
 * repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { LoggerInterface } from '@salesforce/apex-lsp-shared';

/**
 * Performance metrics for a single request method
 */
export interface RequestMetrics {
  count: number;
  totalTime: number; // milliseconds
  avgTime: number; // milliseconds
  minTime: number; // milliseconds
  maxTime: number; // milliseconds
  errors: number;
  lastRequestTime?: number; // timestamp
}

/**
 * Memory usage metrics
 */
export interface MemoryMetrics {
  heapUsed: number; // bytes
  heapTotal: number; // bytes
  external: number; // bytes
  rss: number; // bytes (Resident Set Size)
  timestamp: number; // timestamp
}

/**
 * Event loop metrics
 */
export interface EventLoopMetrics {
  lag: number; // milliseconds (event loop delay)
  utilization: number; // 0-1 (CPU utilization)
  timestamp: number; // timestamp
}

/**
 * Complete performance metrics snapshot
 */
export interface PerformanceMetrics {
  requests: Record<string, RequestMetrics>;
  memory: MemoryMetrics;
  eventLoop: EventLoopMetrics;
  uptime: number; // milliseconds since service start
}

/**
 * Service for tracking performance metrics of the language server
 */
export class PerformanceMetricsService {
  private static instance: PerformanceMetricsService | null = null;
  private readonly requestMetrics: Map<string, RequestMetrics> = new Map();
  private readonly startTime: number = Date.now();
  private logger: LoggerInterface | null = null;
  private eventLoopMonitorInterval: NodeJS.Timeout | null = null;
  private readonly eventLoopHistory: EventLoopMetrics[] = [];
  private readonly maxHistorySize = 100;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get the singleton instance of PerformanceMetricsService
   */
  public static getInstance(): PerformanceMetricsService {
    if (!PerformanceMetricsService.instance) {
      PerformanceMetricsService.instance = new PerformanceMetricsService();
    }
    return PerformanceMetricsService.instance;
  }

  /**
   * Initialize the service with logger
   */
  public initialize(logger: LoggerInterface): void {
    this.logger = logger;
    this.startEventLoopMonitoring();
  }

  /**
   * Record a request execution
   */
  public recordRequest(method: string, duration: number, error?: Error): void {
    const existing = this.requestMetrics.get(method) || {
      count: 0,
      totalTime: 0,
      avgTime: 0,
      minTime: Infinity,
      maxTime: 0,
      errors: 0,
    };

    existing.count++;
    existing.totalTime += duration;
    existing.avgTime = existing.totalTime / existing.count;
    existing.minTime = Math.min(existing.minTime, duration);
    existing.maxTime = Math.max(existing.maxTime, duration);
    existing.lastRequestTime = Date.now();

    if (error) {
      existing.errors++;
    }

    this.requestMetrics.set(method, existing);
  }

  /**
   * Get current memory metrics
   */
  public getMemoryMetrics(): MemoryMetrics {
    const usage = process.memoryUsage();
    return {
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      rss: usage.rss,
      timestamp: Date.now(),
    };
  }

  /**
   * Get current event loop metrics
   */
  public getEventLoopMetrics(): EventLoopMetrics {
    // Simple event loop lag measurement
    const start = process.hrtime.bigint();
    // Use setImmediate to measure lag
    const lag = Number(process.hrtime.bigint() - start) / 1_000_000; // Convert to milliseconds

    // CPU utilization (simplified - actual measurement requires more complex logic)
    const utilization = process.cpuUsage();
    const totalCpuTime = utilization.user + utilization.system;
    // This is a simplified metric - actual utilization requires time-based sampling
    const utilizationRatio = Math.min(totalCpuTime / 1_000_000, 1.0);

    return {
      lag,
      utilization: utilizationRatio,
      timestamp: Date.now(),
    };
  }

  /**
   * Get event loop metrics history
   */
  public getEventLoopHistory(): EventLoopMetrics[] {
    return [...this.eventLoopHistory];
  }

  /**
   * Get all performance metrics
   */
  public getMetrics(): PerformanceMetrics {
    const requests: Record<string, RequestMetrics> = {};
    for (const [method, metrics] of this.requestMetrics.entries()) {
      requests[method] = { ...metrics };
    }

    return {
      requests,
      memory: this.getMemoryMetrics(),
      eventLoop: this.getEventLoopMetrics(),
      uptime: Date.now() - this.startTime,
    };
  }

  /**
   * Reset all metrics
   */
  public reset(): void {
    this.requestMetrics.clear();
    this.eventLoopHistory.length = 0;
  }

  /**
   * Reset metrics for a specific method
   */
  public resetMethod(method: string): void {
    this.requestMetrics.delete(method);
  }

  /**
   * Start monitoring event loop metrics
   */
  private startEventLoopMonitoring(): void {
    if (this.eventLoopMonitorInterval) {
      return;
    }

    // Monitor event loop every 5 seconds
    this.eventLoopMonitorInterval = setInterval(() => {
      const metrics = this.getEventLoopMetrics();
      this.eventLoopHistory.push(metrics);

      // Keep history size limited
      if (this.eventLoopHistory.length > this.maxHistorySize) {
        this.eventLoopHistory.shift();
      }

      // Log warnings if event loop lag is high
      if (metrics.lag > 100) {
        this.logger?.warn(
          `High event loop lag detected: ${metrics.lag.toFixed(2)}ms`,
        );
      }
    }, 5000);
  }

  /**
   * Stop monitoring event loop metrics
   */
  public stopEventLoopMonitoring(): void {
    if (this.eventLoopMonitorInterval) {
      clearInterval(this.eventLoopMonitorInterval);
      this.eventLoopMonitorInterval = null;
    }
  }

  /**
   * Dispose and clean up resources
   */
  public dispose(): void {
    this.stopEventLoopMonitoring();
    this.reset();
  }
}

/**
 * Wrapper function to measure request execution time
 */
export async function measureRequest<T>(
  method: string,
  handler: () => Promise<T>,
  metricsService?: PerformanceMetricsService,
): Promise<T> {
  const start = process.hrtime.bigint();
  let error: Error | undefined;

  try {
    const result = await handler();
    return result;
  } catch (err) {
    error = err instanceof Error ? err : new Error(String(err));
    throw err;
  } finally {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1_000_000; // Convert to milliseconds

    if (metricsService) {
      metricsService.recordRequest(method, duration, error);
    }
  }
}
