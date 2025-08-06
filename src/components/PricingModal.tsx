import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Crown, Zap, X } from "lucide-react";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro'>('pro');

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '₹0',
      period: 'forever',
      description: 'Perfect for trying out our AI tools',
      features: [
        '3 resume analyses per day',
        '3 email improvements per day',
        'Basic AI suggestions',
        'PDF export',
        'Standard support'
      ],
      limitations: [
        'Daily usage limits',
        'No priority processing',
        'Limited features'
      ],
      buttonText: 'Current Plan',
      buttonVariant: 'outline' as const,
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '₹399',
      period: 'per month',
      description: 'Unlimited access to all AI-powered features',
      features: [
        'Unlimited resume analyses',
        'Unlimited email improvements',
        'Advanced AI suggestions',
        'Priority processing',
        'Cover letter generation',
        'ATS optimization scores',
        'Email tone analysis',
        'Usage history',
        'Premium support',
        'Early access to new features'
      ],
      limitations: [],
      buttonText: 'Upgrade Now',
      buttonVariant: 'default' as const,
      popular: true
    }
  ];

  const handleUpgrade = () => {
    // In a real app, this would integrate with a payment processor
    alert('Payment integration would be implemented here. For demo purposes, this would redirect to a payment page.');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">
                Choose Your Plan
              </DialogTitle>
              <DialogDescription className="mt-2">
                Unlock the full power of Fixora.ai with unlimited access to all features
              </DialogDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative p-6 cursor-pointer transition-all ${
                selectedPlan === plan.id
                  ? 'ring-2 ring-primary border-primary'
                  : 'hover:border-primary/50'
              } ${plan.popular ? 'border-primary' : ''}`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                  <Crown className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">/{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="space-y-3 mb-6">
                <h4 className="font-semibold text-sm">Features included:</h4>
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {plan.limitations.length > 0 && (
                <div className="space-y-2 mb-6 p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-sm text-muted-foreground">Limitations:</h4>
                  {plan.limitations.map((limitation, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <X className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">{limitation}</span>
                    </div>
                  ))}
                </div>
              )}

              <Button
                className="w-full"
                variant={plan.buttonVariant}
                disabled={plan.id === 'free'}
                onClick={plan.id === 'pro' ? handleUpgrade : undefined}
              >
                {plan.id === 'pro' && <Crown className="w-4 h-4 mr-2" />}
                {plan.buttonText}
              </Button>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">Why upgrade?</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Get unlimited access to our AI-powered tools, priority processing, and advanced features. 
            Perfect for job seekers, professionals, and anyone who wants to optimize their communication.
          </p>
        </div>

        <div className="text-center mt-4">
          <p className="text-xs text-muted-foreground">
            Secure payment • Cancel anytime • 30-day money-back guarantee
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
