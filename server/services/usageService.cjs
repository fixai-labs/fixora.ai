class UsageService {
  static usageData = new Map();
  static DAILY_LIMIT = 3;

  static getUsageKey(ip) {
    const today = new Date().toISOString().split('T')[0];
    return `${ip}-${today}`;
  }

  static getCurrentUsage(ip) {
    const key = this.getUsageKey(ip);
    const record = this.usageData.get(key);
    return record ? record.count : 0;
  }

  static getRemainingUsage(ip) {
    const current = this.getCurrentUsage(ip);
    return Math.max(0, this.DAILY_LIMIT - current);
  }

  static canUseService(ip) {
    return this.getCurrentUsage(ip) < this.DAILY_LIMIT;
  }

  static incrementUsage(ip) {
    const key = this.getUsageKey(ip);
    const currentUsage = this.getCurrentUsage(ip);

    if (currentUsage >= this.DAILY_LIMIT) {
      return {
        success: false,
        remaining: 0,
        limitReached: true
      };
    }

    const newCount = currentUsage + 1;
    const today = new Date().toISOString().split('T')[0];
    
    this.usageData.set(key, {
      ip,
      date: today,
      count: newCount
    });

    return {
      success: true,
      remaining: this.DAILY_LIMIT - newCount,
      limitReached: newCount >= this.DAILY_LIMIT
    };
  }

  static getUsageStatus(ip) {
    const used = this.getCurrentUsage(ip);
    const remaining = this.getRemainingUsage(ip);
    
    return {
      used,
      remaining,
      limit: this.DAILY_LIMIT,
      canUse: this.canUseService(ip)
    };
  }

  // Clean up old usage records (run this periodically)
  static cleanupOldRecords() {
    const today = new Date().toISOString().split('T')[0];
    
    for (const [key, record] of this.usageData.entries()) {
      if (record.date !== today) {
        this.usageData.delete(key);
      }
    }
  }
}

module.exports = { UsageService };
