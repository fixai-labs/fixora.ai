import { Request, Response, NextFunction } from 'express';
import { UsageService } from '../services/usageService';

export interface RequestWithUsage extends Request {
  usage?: {
    used: number;
    remaining: number;
    limit: number;
    canUse: boolean;
  };
}

export const checkUsageLimit = (req: RequestWithUsage, res: Response, next: NextFunction) => {
  try {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const usageStatus = UsageService.getUsageStatus(clientIP);
    
    // Add usage info to request
    req.usage = usageStatus;
    
    // Check if user can use the service
    if (!usageStatus.canUse) {
      return res.status(429).json({
        error: 'Usage limit exceeded',
        message: `You have reached your daily limit of ${usageStatus.limit} free uses. Please upgrade to continue.`,
        usage: usageStatus,
        upgrade: {
          message: 'Upgrade to unlimited usage',
          price: '₹399/month',
          features: [
            'Unlimited resume analysis',
            'Unlimited email improvements',
            'Priority processing',
            'Advanced features'
          ]
        }
      });
    }
    
    next();
  } catch (error) {
    console.error('Usage limit check error:', error);
    next(); // Continue on error to not block the service
  }
};

export const incrementUsage = (req: RequestWithUsage, res: Response, next: NextFunction) => {
  try {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const result = UsageService.incrementUsage(clientIP);
    
    if (!result.success) {
      return res.status(429).json({
        error: 'Usage limit exceeded',
        message: 'You have reached your daily limit. Please upgrade to continue.',
        usage: {
          used: UsageService.getCurrentUsage(clientIP),
          remaining: 0,
          limit: 3,
          canUse: false
        }
      });
    }
    
    // Add usage info to response headers
    res.setHeader('X-Usage-Remaining', result.remaining.toString());
    res.setHeader('X-Usage-Limit-Reached', result.limitReached.toString());
    
    next();
  } catch (error) {
    console.error('Usage increment error:', error);
    next(); // Continue on error
  }
};
